"use client";

import { useActionState } from "react";
import { cancelReservation, reserveBook } from "@/lib/actions";
import { idleState } from "@/lib/action-state";

export function ReserveButton({ bookId }: { bookId: string }) {
  const [state, formAction, pending] = useActionState(reserveBook, idleState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="bookId" value={bookId} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-ember px-6 py-3 font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Joining queue..." : "Reserve this book"}
        </button>
      </form>
      {state.message ? (
        <p
          role="status"
          className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${
            state.ok ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [state, formAction, pending] = useActionState(cancelReservation, idleState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="reservationId" value={reservationId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted hover:border-ember hover:text-ember disabled:opacity-60"
        >
          {pending ? "Cancelling..." : "Cancel"}
        </button>
      </form>
      {state.message ? (
        <p role="status" className="mt-2 text-xs text-muted">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
