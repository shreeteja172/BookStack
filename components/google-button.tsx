"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function GoogleButton({ redirectTo }: { redirectTo: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    await signIn.social({ provider: "google", callbackURL: redirectTo });
    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:border-indigo-300 disabled:opacity-60"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.6-5.2 3.6-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 8-3l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
        />
        <path fill="#FBBC05" d="M5.3 14.2a7.1 7.1 0 0 1 0-4.6V6.5h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.3 6.5l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
        />
      </svg>
      {isPending ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
