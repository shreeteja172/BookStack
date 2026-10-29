"use client";

import { useActionState, useCallback, useRef, useState, useTransition } from "react";
import { createBook, updateBook } from "@/lib/book-actions";
import { lookupIsbn } from "@/lib/isbn-lookup";
import { idleState } from "@/lib/action-state";
import { BarcodeScanner } from "./barcode-scanner";

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-4 py-3 outline-none focus:border-brand";

type BookValues = {
  id?: string;
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string | null;
  category?: string;
  publishedYear?: number | null;
  description?: string | null;
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function Shared({ values, categories }: { values: BookValues; categories: string[] }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="title" label="Title">
          <input id="title" name="title" required defaultValue={values.title} className={fieldClass} />
        </Field>
        <Field id="author" label="Author">
          <input id="author" name="author" required defaultValue={values.author} className={fieldClass} />
        </Field>
        <Field id="isbn" label="ISBN">
          <input id="isbn" name="isbn" required defaultValue={values.isbn} className={fieldClass} />
        </Field>
        <Field id="category" label="Category">
          <input
            id="category"
            name="category"
            required
            list="category-options"
            defaultValue={values.category}
            className={fieldClass}
          />
          <datalist id="category-options">
            {categories.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>
        <Field id="publisher" label="Publisher">
          <input
            id="publisher"
            name="publisher"
            defaultValue={values.publisher ?? ""}
            className={fieldClass}
          />
        </Field>
        <Field id="publishedYear" label="Published year">
          <input
            id="publishedYear"
            name="publishedYear"
            inputMode="numeric"
            defaultValue={values.publishedYear ?? ""}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field id="description" label="Description">
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={values.description ?? ""}
            className={fieldClass}
          />
        </Field>
      </div>
    </>
  );
}

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

function IsbnAutofill({ formRef }: { formRef: React.RefObject<HTMLFormElement | null> }) {
  const [isbn, setIsbn] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string }>({ ok: true, message: "" });
  const [pending, startTransition] = useTransition();

  const fill = useCallback(
    (value: string) => {
      setIsbn(value);
      startTransition(async () => {
        const result = await lookupIsbn(value);
        const form = formRef.current;

        if (!result.ok || !form) {
          setStatus({ ok: false, message: result.ok ? "Form not ready." : result.message });
          return;
        }

        const values: Record<string, string> = {
          ...result.details,
          isbn: value.replace(/[^0-9Xx]/g, ""),
        };

        for (const [name, text] of Object.entries(values)) {
          const field = form.elements.namedItem(name);

          if (text && (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            field.value = text;
          }
        }

        setStatus({ ok: true, message: `Filled in "${result.details.title}". Check the fields, then add it.` });
      });
    },
    [formRef],
  );

  return (
    <div className="mb-8 rounded-2xl border border-dashed border-brand-light bg-brand/5 p-5">
      <p className="font-bold">Autofill from ISBN</p>
      <p className="mt-1 text-sm text-muted">
        Scan the barcode on the back cover or type the ISBN. Details are pulled from Open Library, with
        Google Books as a fallback.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={isbn}
          onChange={(event) => setIsbn(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              fill(isbn);
            }
          }}
          placeholder="9780441013593"
          inputMode="numeric"
          className={`${fieldClass} max-w-xs font-mono`}
        />
        <button
          type="button"
          onClick={() => fill(isbn)}
          disabled={pending || isbn.trim().length === 0}
          className="rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Looking up..." : "Fetch details"}
        </button>
      </div>
      <div className="mt-3">
        <BarcodeScanner onDetected={fill} />
      </div>
      <Feedback ok={status.ok} message={status.message} />
    </div>
  );
}

export function NewBookForm({ categories }: { categories: string[] }) {
  const [state, formAction, pending] = useActionState(createBook, idleState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-line bg-surface p-6">
      <IsbnAutofill formRef={formRef} />
      <Shared values={{}} categories={categories} />

      <h2 className="mt-8 border-t border-line pt-6 text-lg font-bold">Copies and location</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <Field id="copies" label="How many copies">
          <input id="copies" name="copies" defaultValue={1} inputMode="numeric" className={fieldClass} />
        </Field>
        <Field id="floor" label="Floor">
          <input id="floor" name="floor" defaultValue="1" className={fieldClass} />
        </Field>
        <Field id="shelf" label="Shelf">
          <input id="shelf" name="shelf" defaultValue="A" className={fieldClass} />
        </Field>
        <Field id="row" label="Row">
          <input id="row" name="row" defaultValue="1" className={fieldClass} />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add to catalogue"}
      </button>

      <Feedback ok={state.ok} message={state.message} />
    </form>
  );
}

export function EditBookForm({
  values,
  categories,
}: {
  values: BookValues;
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState(updateBook, idleState);

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-6">
      <input type="hidden" name="bookId" value={values.id} />
      <Shared values={values} categories={categories} />

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>

      <Feedback ok={state.ok} message={state.message} />
    </form>
  );
}
