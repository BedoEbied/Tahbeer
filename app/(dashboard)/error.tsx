'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6 space-y-3">
      <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
      <p className="text-sm text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  );
}
