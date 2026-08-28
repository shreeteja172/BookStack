import Link from "next/link";
import type { Metadata } from "next";
import { GoogleButton } from "@/components/google-button";
import { isGoogleAuthConfigured } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create an account · BookStack",
  description: "Join BookStack and start borrowing books.",
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const redirectTo = safeRedirectPath((await searchParams).redirectTo);

  return (
    <div className="rounded-3xl border border-line bg-surface p-8 shadow-xl shadow-brand/10">
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted">
        Start borrowing books in minutes. No credit card required.
      </p>

      <div className="mt-8">
        <SignUpForm redirectTo={redirectTo} />
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
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-brand hover:text-ember">
          Sign in
        </Link>
      </p>
    </div>
  );
}
