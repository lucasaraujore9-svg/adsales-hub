function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function AudiencesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-24" />
          <Box className="mt-3 h-10 w-48" />
          <Box className="mt-3 h-3 w-72" />
        </div>
        <div className="flex gap-2">
          <Box className="h-8 w-24" />
          <Box className="h-8 w-24" />
          <Box className="h-8 w-32" />
        </div>
      </header>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
