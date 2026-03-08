"use client";

import { revalidate } from "@solidjs/router";
import { getSession } from "~/auth/session";

export function LogoutButton() {
  // const nav = useNavigate();
  async function handleLogout() {
    await fetch("/oauth/logout", { method: "POST" });
    revalidate(getSession.key);
  }

  return (
    <button
      onClick={handleLogout}
      class="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
    >
      Sign out
    </button>
  );
}
