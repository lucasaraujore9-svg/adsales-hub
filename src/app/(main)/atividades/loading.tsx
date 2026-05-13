function Box({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />
  );
}

export default function ActivitiesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Box className="h-3 w-12" />
          <Box className="mt-3 h-10 w-48" />
          <Box className="mt-3 h-3 w-72" />
        </div>
        <Box className="h-8 w-36" />
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Box className="h-7 w-48" />
        <Box className="h-8 w-40" />
        <Box className="h-8 w-44" />
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-[color:var(--line)] last:border-b-0">
            <div className="bg-[color:var(--bg-2)]/40 p-3">
              <Box className="h-4 w-44" />
            </div>
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Box key={j} className="h-10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
