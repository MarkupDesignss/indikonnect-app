"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-gray-600">We could not load this page. Please try again.</p>
      <button type="button" onClick={reset} className="rounded-md bg-[#06101E] px-5 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        Try again
      </button>
    </main>
  );
}
