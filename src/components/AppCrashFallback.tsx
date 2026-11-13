/** Last-resort screen when rendering fails: never leave the user on a blank page. */
export function AppCrashFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-gray-900">
      <div role="alert" className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">An unexpected error stopped this page from loading.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Reload page
        </button>
      </div>
    </main>
  );
}
