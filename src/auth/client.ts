"use server";
import {
  NodeOAuthClient,
  buildAtprotoLoopbackClientMetadata,
  requestLocalLock,
} from "@atproto/oauth-client-node";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const SCOPE = "atproto repo:xyz.statusphere.status";

let client: NodeOAuthClient | null = null;

export async function getOAuthClient(): Promise<NodeOAuthClient> {
  if (client) return client;
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

  client = new NodeOAuthClient({
    clientMetadata: buildAtprotoLoopbackClientMetadata({
      scope: SCOPE,
      redirect_uris: ["http://127.0.0.1:3000/oauth/callback"],
    }),
    requestLock: requestLocalLock,
    stateStore: {
      set: async (key, state) => {
        await convex.mutation(api.auth.setState, { key, state });
      },
      get: async (key) => {
        const result = await convex.query(api.auth.getState, { key });
        return result ? result.state : undefined;
      },
      del: async (key) => {
        await convex.mutation(api.auth.delState, { key });
      },
    },

    sessionStore: {
      set: async (sub, sessionData) => {
        await convex.mutation(api.auth.setSession, {
          did: sub,
          session: sessionData,
        });
      },
      get: async (sub) => {
        const result = await convex.query(api.auth.getSession, { did: sub });
        return result ? result.session : undefined;
      },
      del: async (sub) => {
        await convex.mutation(api.auth.delSession, { did: sub });
      },
    },
  });

  return client;
}
