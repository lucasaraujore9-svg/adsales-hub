function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function SocialLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Box className="h-3 w-28" />
          <Box className="mt-3 h-10 w-56" />
          <Box className="mt-3 h-3 w-72" />
        </div>
        <div className="flex gap-2"><Box className="h-8 w-32" /><Box className="h-8 w-44" /></div>
      </header>
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="h-24" />))}
      </section>
      <Box className="mb-8 h-24" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (<Box key={i} className="aspect-square" />))}
      </div>
    </div>
  );
}
