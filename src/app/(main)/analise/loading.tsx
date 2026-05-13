function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function AnaliseLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8">
        <Box className="h-3 w-20" />
        <Box className="mt-3 h-10 w-72" />
        <Box className="mt-3 h-3 w-96" />
      </header>
      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        <div className="space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
          {Array.from({ length: 5 }).map((_, i) => (<Box key={i} className="h-12" />))}
        </div>
        <Box className="h-[480px]" />
      </div>
      <section className="mt-8 space-y-2">
        <Box className="h-4 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="h-16" />))}
      </section>
    </div>
  );
}
