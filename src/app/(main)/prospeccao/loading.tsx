function Box({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />;
}

export default function ProspectingLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8">
        <Box className="h-3 w-12" />
        <Box className="mt-3 h-10 w-48" />
        <Box className="mt-3 h-3 w-72" />
      </header>
      <Box className="h-64" />
      <Box className="mt-6 h-32" />
    </div>
  );
}
