import { Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { getSession } from "~/auth/session";
import { LoginForm } from "~/components/LoginForm";
import { StatusPicker } from "~/components/StatusPicker";
import { createQuery } from "~/utilities/convex";
import { createStatusStore } from "~/utilities/createStatusStore";
import { api } from "../../convex/_generated/api";
import { type FunctionReturnType } from "convex/server";

export default function Home() {
  const session = createAsync(() => getSession());
  const { status, setStatus, isPending } = createStatusStore(session);
  const recentStatuses = createQuery<FunctionReturnType<typeof api.status.getRecentStatuses>>(
    api.status.getRecentStatuses,
  );

  return (
    <main>
      <Suspense>
        <Title>Statusphere</Title>
        <h1>Statusphere</h1>
        {!session() && <LoginForm />}
        {session() && (
          <>
            <StatusPicker status={status()} setStatus={setStatus} isPending={isPending()} />
            <ul>
              <For each={recentStatuses()}>
                {(statusItem) => {
                  return (
                    <li>
                      {statusItem.status} {statusItem.account?.handle}
                    </li>
                  );
                }}
              </For>
            </ul>
          </>
        )}
      </Suspense>
      {/* TODO: logout button */}
    </main>
  );
}
