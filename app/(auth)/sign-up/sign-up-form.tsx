"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const { error } = await signUp.email({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    if (error) {
      setError(error.message ?? "Could not create your account. Please try again.");
      setIsPending(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-ember/10 px-4 py-3 text-sm font-medium text-ember"
        >
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-ink">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Alex Fernandes"
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@library.org"
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-brand"
        />
        <p className="mt-2 text-xs text-muted">Must be at least 8 characters.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-ember px-6 py-3.5 font-semibold text-white shadow-lg shadow-ember/25 hover:brightness-95 disabled:opacity-60"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
