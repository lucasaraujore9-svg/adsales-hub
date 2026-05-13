function Box({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />
  );
}

export default function DealDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Box className="h-3 w-20" />

      <header className="mt-3 mb-8">
        <Box className="h-3 w-32" />
        <Box className="mt-3 h-10 w-96" />
        <Box className="mt-3 h-3 w-72" />
      </header>

      <Box className="mb-6 h-16" />

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-20" />
        ))}
      </div>

      <div className="mb-6 flex gap-2 border-b border-[color:var(--line)] pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Box key={i} className="h-8 w-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Box className="h-32" />
          <Box className="h-48" />
        </div>
        <aside className="space-y-4">
          <Box className="h-40" />
          <Box className="h-32" />
        </aside>
      </div>
    </div>
  );
}
