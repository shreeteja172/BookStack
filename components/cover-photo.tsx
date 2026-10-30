"use client";

import { useState } from "react";
import Image from "next/image";

type CoverPhotoProps = {
  isbn: string;
  alt: string;
  eager?: boolean;
};

export function CoverPhoto({ isbn, alt, eager }: CoverPhotoProps) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const clean = isbn.replace(/[^0-9Xx]/g, "");

  if (state === "failed" || clean.length < 10) {
    return null;
  }

  return (
    <Image
      src={`https://covers.openlibrary.org/b/isbn/${clean}-M.jpg?default=false`}
      alt={alt}
      fill
      sizes="(max-width: 640px) 128px, 160px"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      ref={(node) => {
        if (node?.complete && state === "loading") {
          setState(node.naturalWidth > 1 ? "ready" : "failed");
        }
      }}
      onLoad={(event) => setState(event.currentTarget.naturalWidth > 1 ? "ready" : "failed")}
      onError={() => setState("failed")}
      className={`object-cover transition-opacity duration-300 ${
        state === "ready" ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
