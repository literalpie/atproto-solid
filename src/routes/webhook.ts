import { parseTapEvent, assureAdminAuth } from "@atproto/tap";
import { AtUri } from "@atproto/syntax";
import * as xyz from "~/lexicons/xyz";
import { json } from "@solidjs/router";
import { api } from "../../convex/_generated/api";
import { RequestEvent } from "solid-js/web";
import { convexHttpClient } from "~/utilities/contextHttpClient";

const TAP_ADMIN_PASSWORD = process.env.TAP_ADMIN_PASSWORD;

export async function POST({ request }: RequestEvent) {
  // Verify request is from our TAP server
  if (TAP_ADMIN_PASSWORD) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      assureAdminAuth(TAP_ADMIN_PASSWORD, authHeader);
    } catch {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json();
  const evt = parseTapEvent(body);

  // Handle account/identity changes
  if (evt.type === "identity") {
    if (evt.status === "deleted") {
      await convexHttpClient.mutation(api.status.deleteAccount, { did: evt.did });
    } else {
      await convexHttpClient.mutation(api.status.setAccount, {
        active: evt.isActive,
        handle: evt.handle,
        did: evt.did,
      });
    }
  }

  // Handle status record changes
  if (evt.type === "record") {
    const uri = AtUri.make(evt.did, evt.collection, evt.rkey);

    if (evt.action === "create" || evt.action === "update") {
      let record: xyz.statusphere.status.Main;
      try {
        record = xyz.statusphere.status.$parse(evt.record);
      } catch {
        return json({ success: false });
      }

      await convexHttpClient.mutation(api.status.setStatus, {
        uri: uri.toString(),
        authorDid: evt.did,
        status: record.status,
        createdAt: record.createdAt,
        indexedAt: new Date().toISOString(),
      });
    } else if (evt.action === "delete") {
      await convexHttpClient.mutation(api.status.deleteStatus, { uri: uri.toString() });
    }
  }

  return json({ success: true });
}
