"use server";
import { APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import { getOAuthClient, SCOPE } from "~/auth/client";

export async function POST({request}: APIEvent) {
  try {
    const { handle } = await request.json();
    console.log('request', handle);

    if (!handle || typeof handle !== "string") {
      return json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    const client = await getOAuthClient();
    // Resolves handle, finds their auth server, returns authorization URL
    const authUrl = await client.authorize(handle, {
      scope: SCOPE,
    });
    console.log('redirect', authUrl.toString())

    return json({ redirectUrl: authUrl.toString() });
  } catch (error) {
    console.error("OAuth login error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
