"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Unhandled application error", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-6 text-center">
          <section className="max-w-md space-y-4">
            <p className="text-sm font-medium text-primary">Application error</p>
            <h1 className="text-3xl font-semibold tracking-tight">We could not load Social App.</h1>
            <p className="text-muted-foreground">Try again to reload the application.</p>
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={reset}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
