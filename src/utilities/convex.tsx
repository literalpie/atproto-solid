import { ConvexClient } from "convex/browser";
import { type FunctionReference } from "convex/server";
import { Context, createContext, createSignal, onCleanup, useContext } from "solid-js";
import { isServer } from "solid-js/web";

export const ConvexContext: Context<ConvexClient | undefined> = createContext();

export function createQuery<T>(
  query: FunctionReference<"query">,
  args?: {},
  initialData?: T,
): () => T | undefined {
  if (isServer) return () => initialData;

  const convex = useContext(ConvexContext);
  if (!convex) throw "No convex context";

  const [data, setData] = createSignal<T | undefined>(initialData);

  const unsub = convex.onUpdate(query, args ?? {}, (value: T) => {
    setData(() => value);
  });

  onCleanup(unsub);

  return () => data();
}

// export function createMutation<T>(
//   mutation: FunctionReference<"mutation">,
// ): (args?: {}) => Promise<T> {
//   const convex = useContext(ConvexContext);
//   if (convex === undefined) {
//     throw "No convex context";
//   }

//   return (args) => {
//     let fullArgs = args ?? {};
//     return convex.mutation(mutation, fullArgs);
//   };
// }

// export function createAction<T>(action: FunctionReference<"action">): (args?: {}) => Promise<T> {
//   const convex = useContext(ConvexContext);
//   if (convex === undefined) {
//     throw "No convex context";
//   }
//   return (args) => {
//     let fullArgs = args ?? {};
//     return convex.action(action, fullArgs);
//   };
// }
