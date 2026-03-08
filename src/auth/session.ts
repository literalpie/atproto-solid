"use server";
import { deleteCookie, getCookie } from "@solidjs/start/http";
import { getOAuthClient } from "./client";
import { type APIEvent } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { query } from "@solidjs/router";

export const getSession = query(async () => {
  const event = getRequestEvent()?.nativeEvent;
  if (!event) return null;

  const did = await getDid(event);
  if (!did) return null;

  const client = await getOAuthClient();
  try {
    const sess = await client.restore(did);
    return {
      did: sess.did,
    };
  } catch (e) {
    console.log("error", e);
    client.revoke(did);
    deleteCookie(event, "did");
    return null;
  }
}, "session");

export async function getDid(event: APIEvent["nativeEvent"]): Promise<string | null> {
  if (!event) {
    return null;
  }
  return getCookie(event, "did") ?? null;
}
