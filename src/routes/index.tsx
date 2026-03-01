import { Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Suspense } from "solid-js";
import { getSession } from "~/auth/session";
import { LoginForm } from "~/components/LoginForm";
import { setStatus } from "~/server/setStatus";


export default function Home() {
  const session = createAsync(()=>getSession())
  return (
    <main>
      <Suspense>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
      {!session() && <LoginForm />}
      {session() && <button onClick={() => {
        setStatus().then(r=>{
          console.log('set status! ', r);
        })
      }}>set status</button>}
      </Suspense>
      {/* TODO: logout button */}
    </main>
  );
}
