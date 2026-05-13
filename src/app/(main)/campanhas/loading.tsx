function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function CampaignsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-32" />
          <Box className="mt-3 h-10 w-72" />
          <Box className="mt-3 h-3 w-48" />
        </div>
        <Box className="h-8 w-36" />
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-24" />
        ))}
      </section>
      <Box className="mb-4 h-9" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
