import Link from "next/link";
import type { Metadata } from "next";
import { GoogleButton } from "@/components/google-button";
import { isGoogleAuthConfigured } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in · BookStack",
  description: "Sign in to manage your library.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const redirectTo = safeRedirectPath((await searchParams).redirectTo);

  return (
    <div className="rounded-3xl border border-line bg-surface p-8 shadow-xl shadow-brand/10">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted">Sign in to pick up where you left off.</p>

      <div className="mt-8">
        <SignInForm redirectTo={redirectTo} />
      </div>

      {isGoogleAuthConfigured ? (
        <>
          <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton redirectTo={redirectTo} />
        </>
      ) : null}

      <p className="mt-8 text-center text-sm text-muted">
        New to BookStack?{" "}
        <Link href="/sign-up" className="font-semibold text-brand hover:text-ember">
          Create an account
        </Link>
      </p>
    </div>
  );
}
