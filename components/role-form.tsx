"use client";

import { useActionState } from "react";
import { setMemberRole } from "@/lib/actions";
import { idleState } from "@/lib/action-state";

type RoleFormProps = {
  userId: string;
  role: string;
  disabled?: boolean;
};

export function RoleForm({ userId, role, disabled }: RoleFormProps) {
  const [state, formAction, pending] = useActionState(setMemberRole, idleState);
  const nextRole = role === "librarian" ? "member" : "librarian";

  if (disabled) {
    return <span className="text-xs text-muted">That is you</span>;
  }

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="role" value={nextRole} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-brand hover:border-brand-light disabled:opacity-60"
        >
          {pending ? "Saving..." : `Make ${nextRole}`}
        </button>
      </form>
      {state.message ? (
        <p
          role="status"
          className={`mt-2 text-xs ${state.ok ? "text-brand" : "text-ember"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
