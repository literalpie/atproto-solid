"use server";

import { json } from "@solidjs/router";
import { getOAuthClient } from "~/auth/client";

// The URL of this endpoint IS your client_id
// Authorization servers fetch this to learn about your app

export async function GET() {
  const client = await getOAuthClient();
  return json(client.clientMetadata);
}
