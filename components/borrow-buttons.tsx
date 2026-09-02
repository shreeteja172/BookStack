"use client";

import { useActionState } from "react";
import { borrowBook, renewLoan, returnOwnBook } from "@/lib/actions";
import { idleState } from "@/lib/action-state";

function Message({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${
        ok ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
      }`}
    >
      {message}
    </p>
  );
}

export function BorrowButton({ bookId }: { bookId: string }) {
  const [state, formAction, pending] = useActionState(borrowBook, idleState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-ember px-6 py-3 font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Borrowing..." : "Borrow this book"}
        </button>
      </form>
      <Message ok={state.ok} message={state.message} />
    </div>
  );
}

export function ReturnLoanButton({ loanId }: { loanId: string }) {
  const [state, formAction, pending] = useActionState(returnOwnBook, idleState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="loanId" value={loanId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Returning..." : "Return"}
        </button>
      </form>
      <Message ok={state.ok} message={state.message} />
    </div>
  );
}

export function RenewLoanButton({ loanId }: { loanId: string }) {
  const [state, formAction, pending] = useActionState(renewLoan, idleState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="loanId" value={loanId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-brand hover:border-brand-light disabled:opacity-60"
        >
          {pending ? "Renewing..." : "Renew"}
        </button>
      </form>
      <Message ok={state.ok} message={state.message} />
    </div>
  );
}
