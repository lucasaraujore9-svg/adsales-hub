function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function AutomationsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8">
        <Box className="h-3 w-32" />
        <Box className="mt-3 h-10 w-48" />
        <Box className="mt-3 h-3 w-96" />
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="h-24" />))}
      </section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          {Array.from({ length: 5 }).map((_, i) => (<Box key={i} className="h-14" />))}
        </div>
        <Box className="h-72" />
      </div>
    </div>
  );
}
