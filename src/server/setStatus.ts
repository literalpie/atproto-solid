"use server";

import { Client } from "@atproto/lex";
import { getOAuthClient } from "~/auth/client";
import { getSession } from "~/auth/session";
import { statusphere } from "~/lexicons/xyz";

export const setStatus = async () => {
  const session = await getSession();
  if (!session) return;
  const client = await getOAuthClient();
  const oauthSession = await client.restore(session.did);
  const lexClient = new Client(oauthSession);
  try {
    const res = await lexClient.create(statusphere.status, {
      createdAt: new Date().toISOString(),
      status: "B",
    });
    return res.uri;
  } catch (e) {
    return "error" + e.message;
  }
};
