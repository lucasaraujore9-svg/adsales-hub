function ShimmerBox({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`}
    />
  );
}

function ShimmerCard({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5 ${className ?? ""}`}
    >
      <div className="h-3 w-20 rounded bg-[color:var(--bg-2)]" />
      <div className="mt-3 h-8 w-32 rounded bg-[color:var(--bg-2)]" />
      <div className="mt-2 h-3 w-24 rounded bg-[color:var(--bg-2)]" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <ShimmerBox className="h-3 w-24" />
          <ShimmerBox className="mt-3 h-10 w-72" />
          <ShimmerBox className="mt-3 h-3 w-96" />
        </div>
        <div className="flex flex-wrap gap-2">
          <ShimmerBox className="h-8 w-32" />
          <ShimmerBox className="h-8 w-32" />
          <ShimmerBox className="h-8 w-32" />
          <ShimmerBox className="h-8 w-32" />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
          >
            <ShimmerBox className="h-3 w-16" />
            <ShimmerBox className="mt-3 h-5 w-32" />
            <ShimmerBox className="mt-4 h-20 w-full" />
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="animate-pulse rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5 lg:col-span-2">
          <ShimmerBox className="h-3 w-20" />
          <ShimmerBox className="mt-3 h-5 w-40" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerBox key={i} className="h-6" />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <ShimmerBox className="h-3 w-16" />
          <ShimmerBox className="mt-3 h-5 w-32" />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-32 w-32 rounded-full bg-[color:var(--bg-2)]" />
            <div className="flex-1 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBox key={i} className="h-3" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="animate-pulse rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <ShimmerBox className="h-3 w-12" />
          <ShimmerBox className="mt-3 h-5 w-48" />
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerBox key={i} className="h-24" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
