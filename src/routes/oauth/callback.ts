"use server";

import { APIEvent } from "@solidjs/start/server";
import { setCookie } from "@solidjs/start/http";
import { redirect } from "@solidjs/router";

import { getOAuthClient } from "~/auth/client";

const PUBLIC_URL = process.env.PUBLIC_URL || "http://127.0.0.1:3000";

export async function GET(request: APIEvent) {
  try {
    console.log("this is the url right?", new URL(request.request.url).searchParams);
    if (!request.nativeEvent) return undefined;

    const params = new URL(request.request.url).searchParams;
    const client = await getOAuthClient();
    console.log("client", !!client);

    // Exchange code for session
    const { session } = await client.callback(params);
    console.log("session", !!session);

    const response = redirect(`${PUBLIC_URL}/`);

    // Set DID cookie
    setCookie("did", session.did, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return redirect(`${PUBLIC_URL}/?error=login_failed`);
  }
}
