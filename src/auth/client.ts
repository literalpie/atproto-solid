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

  console.log('auth store', globalAuth.stateStore, globalAuth.sessionStore);
  client = new NodeOAuthClient({
    clientMetadata: buildAtprotoLoopbackClientMetadata({
      scope: SCOPE,
      redirect_uris: ["http://127.0.0.1:3000/oauth/callback"],
    }),
    requestLock: requestLocalLock,
    stateStore: {
      async get(key: string) {
        console.log('state store get');
        return globalAuth.stateStore.get(key);
      },
      async set(key: string, value: NodeSavedState) {
        console.log('state store set');
        globalAuth.stateStore.set(key, value);
      },
      async del(key: string) {
        console.log('state store del');
        globalAuth.stateStore.delete(key);
      },
    },
    
    sessionStore: {
      async get(key: string) {
        console.log('session store get');
        return globalAuth.sessionStore.get(key);
      },
      async set(key: string, value: NodeSavedSession) {
        console.log('session store set');
        globalAuth.sessionStore.set(key, value);
      },
      async del(key: string) {
        console.log('session store del');
        globalAuth.sessionStore.delete(key);
      },
    },
  });

  return client;
}
