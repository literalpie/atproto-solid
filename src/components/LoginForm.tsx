import { createSignal } from "solid-js";

export function LoginForm() {
  const [handle, setHandle] = createSignal("literalpie.bsky.social");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/oauth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      // Redirect to authorization server
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Handle</label>
        <input
          type="text"
          value={handle()}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="user.example.com"
          disabled={loading()}
        />
      </div>
      {error && <p>{error()}</p>}

      <button type="submit" disabled={loading() || !handle()}>
        {loading() ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
