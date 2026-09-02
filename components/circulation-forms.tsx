"use client";

import { useActionState, useState } from "react";
import { issueBook, returnBook } from "@/lib/actions";
import { idleState } from "@/lib/action-state";
import { BarcodeScanner } from "./barcode-scanner";

function Feedback({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
        ok ? "bg-brand/10 text-brand" : "bg-ember/10 text-ember"
      }`}
    >
      {message}
    </p>
  );
}

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-4 py-3 outline-none focus:border-brand";

export function IssueForm() {
  const [state, formAction, pending] = useActionState(issueBook, idleState);
  const [barcode, setBarcode] = useState("");

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-bold">Issue a book</h2>
      <p className="mt-1 text-sm text-muted">
        Scan the copy barcode or type it, then enter the member email. Due date is set 14 days out.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="issue-barcode" className="mb-2 block text-sm font-semibold">
            Copy barcode
          </label>
          <input
            id="issue-barcode"
            name="barcode"
            required
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="BK-0001-1"
            className={fieldClass}
          />
          <div className="mt-3">
            <BarcodeScanner onDetected={setBarcode} />
          </div>
        </div>
        <div>
          <label htmlFor="issue-email" className="mb-2 block text-sm font-semibold">
            Member email
          </label>
          <input
            id="issue-email"
            name="email"
            type="email"
            required
            placeholder="member@library.org"
            className={fieldClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Issuing..." : "Issue book"}
      </button>

      <Feedback ok={state.ok} message={state.message} />
    </form>
  );
}

export function ReturnForm() {
  const [state, formAction, pending] = useActionState(returnBook, idleState);
  const [barcode, setBarcode] = useState("");

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-bold">Return a book</h2>
      <p className="mt-1 text-sm text-muted">
        Any fine is calculated automatically, and the next member in the queue is notified.
      </p>

      <div className="mt-5">
        <label htmlFor="return-barcode" className="mb-2 block text-sm font-semibold">
          Copy barcode
        </label>
        <input
          id="return-barcode"
          name="barcode"
          required
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          placeholder="BK-0001-1"
          className={fieldClass}
        />
        <div className="mt-3">
          <BarcodeScanner onDetected={setBarcode} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-lg bg-ember px-6 py-3 font-semibold text-white hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Returning..." : "Return book"}
      </button>

      <Feedback ok={state.ok} message={state.message} />
    </form>
  );
}
