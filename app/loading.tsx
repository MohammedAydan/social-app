import Loading from "~/shared/components/loading";

export default function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background" aria-label="Loading">
      <Loading size="32px" />
    </main>
  );
}
