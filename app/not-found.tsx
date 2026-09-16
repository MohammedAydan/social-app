import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <section className="max-w-md space-y-4">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground">The page you requested does not exist.</p>
        <Button asChild><Link href="/">Back to home</Link></Button>
      </section>
    </main>
  );
}
