function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function ContractsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-12" />
          <Box className="mt-3 h-10 w-72" />
          <Box className="mt-3 h-3 w-96" />
        </div>
        <Box className="h-8 w-32" />
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="h-24" />))}
      </section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Box className="h-64" />
        <Box className="h-64" />
      </div>
    </div>
  );
}
