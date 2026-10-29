"use client";

import { useState } from "react";

export function CoverPhoto({ isbn, alt }: { isbn: string; alt: string }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const clean = isbn.replace(/[^0-9Xx]/g, "");

  if (state === "failed" || clean.length < 10) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://covers.openlibrary.org/b/isbn/${clean}-M.jpg?default=false`}
      alt={alt}
      loading="lazy"
      ref={(node) => {
        if (node?.complete && state === "loading") {
          setState(node.naturalWidth > 1 ? "ready" : "failed");
        }
      }}
      onLoad={(event) => setState(event.currentTarget.naturalWidth > 1 ? "ready" : "failed")}
      onError={() => setState("failed")}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
        state === "ready" ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
