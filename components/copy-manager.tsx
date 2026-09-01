"use client";

import { useActionState } from "react";
import { addCopy, deleteBook, removeCopy } from "@/lib/book-actions";
import { idleState } from "@/lib/action-state";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 outline-none focus:border-brand";

const STATUS_LABEL: Record<string, string> = {
  available: "On shelf",
  on_loan: "On loan",
  reserved: "Held for queue",
};

type Copy = {
  id: string;
  barcode: string;
  floor: string;
  shelf: string;
  row: string;
  status: string;
};

export function CopyManager({ bookId, copies }: { bookId: string; copies: Copy[] }) {
  const [addState, addAction, adding] = useActionState(addCopy, idleState);
  const [removeState, removeAction, removing] = useActionState(removeCopy, idleState);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-bold">Copies ({copies.length})</h2>
      <p className="mt-1 text-sm text-muted">
        Barcodes are generated automatically. A copy that is on loan cannot be removed.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="pb-2 font-bold">Barcode</th>
              <th className="pb-2 font-bold">Location</th>
              <th className="pb-2 font-bold">Status</th>
              <th className="pb-2 font-bold" />
            </tr>
          </thead>
          <tbody>
            {copies.map((copy) => (
              <tr key={copy.id} className="border-b border-line last:border-0">
                <td className="py-3 font-mono text-xs">{copy.barcode}</td>
                <td className="py-3">
                  Floor {copy.floor} · Shelf {copy.shelf} · Row {copy.row}
                </td>
                <td className="py-3">{STATUS_LABEL[copy.status] ?? copy.status}</td>
                <td className="py-3 text-right">
                  <form action={removeAction}>
                    <input type="hidden" name="copyId" value={copy.id} />
                    <button
                      type="submit"
                      disabled={removing || copy.status === "on_loan"}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-ember hover:text-ember disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {removeState.message ? (
        <p
          role="status"
          className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium ${
            removeState.ok ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
          }`}
        >
          {removeState.message}
        </p>
      ) : null}

      <form action={addAction} className="mt-6 border-t border-line pt-5">
        <h3 className="text-sm font-bold">Add a copy</h3>
        <input type="hidden" name="bookId" value={bookId} />
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input name="floor" placeholder="Floor" defaultValue="1" className={fieldClass} />
          <input name="shelf" placeholder="Shelf" defaultValue="A" className={fieldClass} />
          <input name="row" placeholder="Row" defaultValue="1" className={fieldClass} />
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add copy"}
          </button>
        </div>
        {addState.message ? (
          <p
            role="status"
            className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium ${
              addState.ok ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
            }`}
          >
            {addState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}

export function DeleteBookForm({ bookId, title }: { bookId: string; title: string }) {
  const [state, formAction, pending] = useActionState(deleteBook, idleState);

  return (
    <div className="rounded-2xl border border-ember/40 bg-ember/5 p-6">
      <h2 className="text-lg font-bold text-ember">Remove from catalogue</h2>
      <p className="mt-1 text-sm text-muted">
        Deletes &quot;{title}&quot;, every copy, and the borrowing history attached to it. This
        cannot be undone.
      </p>
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${title}" and all of its copies?`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="bookId" value={bookId} />
        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg bg-ember px-6 py-3 font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Deleting..." : "Delete book"}
        </button>
      </form>
      {state.message ? (
        <p role="status" className="mt-3 rounded-lg bg-ember/10 px-4 py-2 text-sm font-medium text-ember">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
