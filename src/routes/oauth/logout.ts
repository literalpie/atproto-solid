import { APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import { getOAuthClient } from "~/auth/client";
import { deleteCookie, getCookie } from "@solidjs/start/http";

export async function POST(request: APIEvent) {
  try {
    const did = getCookie("did");

    if (did) {
      const client = await getOAuthClient();
      await client.revoke(did).catch(() => {}); // failure shouldn't prevent logout
      deleteCookie(request.nativeEvent, "did");
    }

    return json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    deleteCookie("did");
    return json({ success: true });
  }
}
