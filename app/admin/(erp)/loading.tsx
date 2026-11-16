export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="h-9 w-56 rounded-control bg-surface-2" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-control bg-surface-2" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-card bg-surface-2" />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-card bg-surface-2" />
    </div>
  );
}
