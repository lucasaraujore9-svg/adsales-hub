function Box({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />
  );
}

export default function InboxLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <Box className="h-3 w-32" />
        <Box className="mt-3 h-10 w-72" />
        <Box className="mt-3 h-3 w-96" />
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-20" />
        ))}
      </section>

      <Box className="h-64" />
    </div>
  );
}
