"use server";
import {
  NodeOAuthClient,
  buildAtprotoLoopbackClientMetadata,
  requestLocalLock,
  type NodeSavedSession,
  type NodeSavedState,
} from "@atproto/oauth-client-node";

export const SCOPE = "atproto repo:xyz.statusphere.status";

// Use globalThis to persist across hot reloads
const globalAuth = globalThis as unknown as {
  stateStore: Map<string, NodeSavedState>;
  sessionStore: Map<string, NodeSavedSession>;
};
globalAuth.stateStore ??= new Map();
globalAuth.sessionStore ??= new Map();

let client: NodeOAuthClient | null = null;

// async might not be needed?
export async function getOAuthClient(): Promise<NodeOAuthClient> {
  if (client) return client;

  client = new NodeOAuthClient({
    clientMetadata: buildAtprotoLoopbackClientMetadata({
      scope: SCOPE,
      redirect_uris: ["http://127.0.0.1:3000/oauth/callback"],
    }),
    requestLock: requestLocalLock,
    stateStore: {
      async get(key: string) {
        return globalAuth.stateStore.get(key);
      },
      async set(key: string, value: NodeSavedState) {
        globalAuth.stateStore.set(key, value);
      },
      async del(key: string) {
        globalAuth.stateStore.delete(key);
      },
    },

    sessionStore: {
      async get(key: string) {
        return globalAuth.sessionStore.get(key);
      },
      async set(key: string, value: NodeSavedSession) {
        globalAuth.sessionStore.set(key, value);
      },
      async del(key: string) {
        globalAuth.sessionStore.delete(key);
      },
    },
  });

  return client;
}
