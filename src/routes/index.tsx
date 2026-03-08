import { Title } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { getSession } from "~/auth/session";
import { LoginForm } from "~/components/LoginForm";
import { StatusPicker } from "~/components/StatusPicker";
import { createStatusStore } from "~/utilities/createStatusStore";
import { api } from "../../convex/_generated/api";
import { LogoutButton } from "~/components/LogoutButton";
import { convexHttpClient } from "~/utilities/contextHttpClient";
import { createQuery } from "~/utilities/convex";

const loadRecentStatuses = query(async () => {
  "use server";
  // fetch initial data however you want server-side
  return await convexHttpClient.query(api.status.getRecentStatuses, {});
}, "recentStatuses");

export const route = {
  load: () => loadRecentStatuses(),
};

export default function Home() {
  const session = createAsync(() => getSession());
  const { status, setStatus, isPending } = createStatusStore(session);
  const initialRecentStatuses = createAsync(() => loadRecentStatuses());
  const recentStatuses = createQuery(api.status.getRecentStatuses, {}, initialRecentStatuses());

  return (
    <div class="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main class="w-full max-w-md mx-auto p-8">
        <Suspense>
          <div class="text-center mb-8">
            <Title>Statusphere</Title>
            <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Statusphere</h1>
            <p class="text-zinc-600 dark:text-zinc-400">Set your status on the Atmosphere</p>
          </div>

          {session() ? (
            <>
              <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <p class="text-sm text-zinc-500 dark:text-zinc-400">
                    Signed In
                    {/* Signed in as @{accountHandle ?? session.did} */}
                  </p>
                  <LogoutButton />
                </div>
                <StatusPicker status={status()} setStatus={setStatus} isPending={isPending()} />
              </div>
            </>
          ) : (
            <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
              <LoginForm />
            </div>
          )}
          <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Recent</h3>

            <Suspense fallback="Loading">
              {(recentStatuses?.()?.length ?? 0) > 0 ? (
                <ul class="space-y-3">
                  <For each={recentStatuses()}>
                    {(statusItem) => {
                      return (
                        <li class="flex items-center gap-3">
                          <span class="text-2xl">{statusItem.status}</span>
                          <span class="text-zinc-600 dark:text-zinc-400 text-sm">
                            @{statusItem.account?.handle}
                          </span>
                          <span class="text-zinc-400 dark:text-zinc-500 text-xs ml-auto">
                            {timeAgo(statusItem.createdAt)}
                          </span>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              ) : (
                <p>No statuses yet. Be the first!</p>
              )}
            </Suspense>
          </div>
        </Suspense>
      </main>
    </div>
  );
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
