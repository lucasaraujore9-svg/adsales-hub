function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function CallAnalysesLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8">
        <Box className="h-3 w-24" />
        <Box className="mt-3 h-10 w-56" />
        <Box className="mt-3 h-3 w-72" />
      </header>
      <div className="space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        {Array.from({ length: 5 }).map((_, i) => (<Box key={i} className="h-16" />))}
      </div>
    </div>
  );
}
