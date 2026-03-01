"use server";
import { getCookie } from "@solidjs/start/http";
import { getOAuthClient } from "./client";
import { getServerFunctionMeta, type APIEvent } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { query } from "@solidjs/router";

export const getSession = query(async () => {
  let event;
  try {
    event = getRequestEvent()?.nativeEvent;
  } catch (e) {
    console.log("the error", e);
    event = null;
  }
  console.log("event", !!event);
  if (!event) {
    console.log("no event");
    return null;
  }

  try {
    const did = await getDid(event);
    console.log("did", !!did);
    if (!did) return null;

    const client = await getOAuthClient();
    const sess = await client.restore(did);
    return {
      did: sess.did,
    };
  } catch (e) {
    console.log("error later");
    return null;
  }
}, "test");

export async function getDid(
  event: APIEvent["nativeEvent"],
): Promise<string | null> {
  if (!event) {
    return null;
  }
  return getCookie(event, "did") ?? null;
}
