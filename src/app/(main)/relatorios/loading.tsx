function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function ReportsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-20" />
          <Box className="mt-3 h-10 w-64" />
          <Box className="mt-3 h-3 w-72" />
        </div>
        <div className="flex gap-2"><Box className="h-8 w-32" /><Box className="h-8 w-36" /></div>
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="h-24" />))}
      </section>
      <section className="mb-8">
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Box key={i} className="h-32" />))}
        </div>
      </section>
      <div className="space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="h-14" />))}
      </div>
    </div>
  );
}
