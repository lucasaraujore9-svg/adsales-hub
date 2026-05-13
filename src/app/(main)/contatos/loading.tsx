function Box({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />
  );
}

export default function ContactsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Box className="h-3 w-12" />
          <Box className="mt-3 h-10 w-40" />
          <Box className="mt-3 h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Box className="h-8 w-24" />
          <Box className="h-8 w-24" />
          <Box className="h-8 w-32" />
        </div>
      </header>

      <Box className="mb-6 h-9 w-full max-w-md" />

      <div className="mb-6 flex flex-wrap gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Box key={i} className="h-7 w-20" />
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} className="h-12" />
          ))}
        </div>
      </div>
    </div>
  );
}
