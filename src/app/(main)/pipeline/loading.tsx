function Box({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[color:var(--bg-2)] ${className ?? ""}`} />
  );
}

export default function PipelineLoading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Box className="h-3 w-12" />
          <Box className="mt-3 h-10 w-40" />
          <Box className="mt-3 h-3 w-64" />
        </div>
        <Box className="h-8 w-32" />
      </header>

      <div className="mb-6 flex items-center gap-2">
        <Box className="h-7 w-24" />
        <Box className="h-7 w-24" />
        <Box className="h-7 w-24" />
        <div className="ml-auto flex gap-2">
          <Box className="h-7 w-32" />
          <Box className="h-7 w-32" />
        </div>
      </div>

      <div className="-mx-6 overflow-hidden px-6">
        <div className="flex w-max gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex w-72 shrink-0 animate-pulse flex-col rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-2"
            >
              <Box className="m-2 h-6" />
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Box key={j} className="h-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
