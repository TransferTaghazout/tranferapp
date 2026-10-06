"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">The page could not be loaded. Try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-12 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
