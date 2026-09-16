"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-dim)]">
        That&apos;s on us, not you. Try again, or head back and pick up where
        you left off.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back to BuildMate
        </Link>
      </div>
    </div>
  );
}
