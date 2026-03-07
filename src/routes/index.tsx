import { Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Suspense } from "solid-js";
import { getSession } from "~/auth/session";
import { LoginForm } from "~/components/LoginForm";
import { StatusPicker } from "~/components/StatusPicker";
import { createStatusStore } from "~/utilities/createStatusStore";

export default function Home() {
  const session = createAsync(() => getSession());
  const { status, setStatus, isPending } = createStatusStore(session);

  return (
    <main>
      <Suspense>
        <Title>Statusphere</Title>
        <h1>Statusphere</h1>
        {!session() && <LoginForm />}
        {session() && (
          <StatusPicker status={status()} setStatus={setStatus} isPending={isPending()} />
        )}
      </Suspense>
      {/* TODO: logout button */}
    </main>
  );
}
