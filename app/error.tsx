"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Application route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <section className="max-w-md space-y-4">
        <p className="text-sm font-medium text-primary">Something went wrong</p>
        <h1 className="text-3xl font-semibold tracking-tight">We could not load this page.</h1>
        <p className="text-muted-foreground">Try again, or return to the home feed.</p>
        <div className="flex justify-center gap-3">
          <Button type="button" onClick={reset}>Try again</Button>
          <Button type="button" variant="outline" onClick={() => window.location.assign("/")}>Home</Button>
        </div>
      </section>
    </main>
  );
}
