function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function CreativesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-24" />
          <Box className="mt-3 h-10 w-72" />
          <Box className="mt-3 h-3 w-48" />
        </div>
        <div className="flex gap-2">
          <Box className="h-8 w-24" />
          <Box className="h-8 w-32" />
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}
