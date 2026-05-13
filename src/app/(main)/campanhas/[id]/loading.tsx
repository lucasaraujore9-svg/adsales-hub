function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function CampaignDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
      <Box className="h-3 w-32" />
      <header className="mt-4 mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-24" />
          <Box className="mt-3 h-10 w-96" />
          <Box className="mt-3 h-3 w-64" />
        </div>
        <Box className="h-8 w-32" />
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} className="h-20" />
        ))}
      </section>
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} className="h-32" />
        ))}
      </section>
      <Box className="h-64" />
    </div>
  );
}
