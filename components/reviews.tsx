"use client";

import { useActionState, useState } from "react";
import { saveReview } from "@/lib/book-actions";
import { idleState } from "@/lib/action-state";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rounded ? "#e3703a" : "none"}
          stroke={star <= rounded ? "#e3703a" : "#a9bfbd"}
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9Z" />
        </svg>
      ))}
    </span>
  );
}

export function RatingSummary({ average, count }: { average: number; count: number }) {
  if (count === 0) {
    return <p className="text-sm text-muted">No ratings yet.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <Stars value={average} />
      <span className="text-sm font-semibold">{average.toFixed(1)}</span>
      <span className="text-sm text-muted">
        ({count} {count === 1 ? "rating" : "ratings"})
      </span>
    </div>
  );
}

export function ReviewForm({
  bookId,
  existingRating,
  existingBody,
  canReview,
}: {
  bookId: string;
  existingRating?: number;
  existingBody?: string | null;
  canReview: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveReview, idleState);
  const [rating, setRating] = useState(existingRating ?? 0);

  if (!canReview) {
    return (
      <p className="rounded-lg bg-sand px-4 py-3 text-sm text-brand">
        You can review this book once you have borrowed it.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Your rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              className="rounded p-0.5 hover:bg-brand/10"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={star <= rating ? "#e3703a" : "none"}
                stroke={star <= rating ? "#e3703a" : "#a9bfbd"}
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9Z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <textarea
        name="body"
        rows={3}
        defaultValue={existingBody ?? ""}
        placeholder="What did you think of it?"
        className="mt-3 w-full rounded-lg border border-line bg-canvas px-4 py-3 outline-none focus:border-brand"
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving..." : existingRating ? "Update review" : "Post review"}
      </button>

      {state.message ? (
        <p
          role="status"
          className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium ${
            state.ok ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
