function Box({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />
  );
}

export default function ContactDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Box className="h-3 w-20" />

      <header className="mt-3 mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-24" />
          <Box className="mt-3 h-10 w-72" />
          <Box className="mt-3 h-3 w-48" />
        </div>
        <Box className="h-7 w-20" />
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Box className="h-48" />
          <Box className="h-64" />
        </div>
        <aside className="space-y-4">
          <Box className="h-40" />
          <Box className="h-32" />
        </aside>
      </div>
    </div>
  );
}
