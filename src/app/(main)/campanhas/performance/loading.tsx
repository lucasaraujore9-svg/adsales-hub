function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function PerformanceLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8">
        <Box className="h-3 w-40" />
        <Box className="mt-3 h-10 w-64" />
        <Box className="mt-3 h-3 w-72" />
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-24" />
        ))}
      </section>
      <Box className="h-96" />
    </div>
  );
}
