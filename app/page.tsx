export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-sm font-medium text-primary">Social App</p>
        <h1 className="text-4xl font-semibold tracking-tight">Next.js migration in progress</h1>
        <p className="max-w-2xl text-muted-foreground">
          The application shell is now running on Next.js. Existing screens will be migrated route by route against the new API contract with verified data flow and authentication boundaries.
        </p>
      </section>
    </main>
  );
}
