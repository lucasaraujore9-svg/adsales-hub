import Link from "next/link";

interface Props {
  daysLeft: number;
  basketName: string | null;
}

export function TrialBanner({ daysLeft, basketName }: Props) {
  if (daysLeft <= 0) return null;

  const tone =
    daysLeft <= 3
      ? {
          bg: "bg-[color:var(--bad)]/10 border-[color:var(--bad)]/30",
          text: "text-[color:var(--bad)]",
        }
      : daysLeft <= 7
        ? {
            bg: "bg-[color:var(--warn)]/10 border-[color:var(--warn)]/30",
            text: "text-[color:var(--warn)]",
          }
        : {
            bg: "bg-[color:var(--panel)] border-[color:var(--line)]",
            text: "text-[color:var(--ink-3)]",
          };

  return (
    <div className={`border-b px-4 py-2 text-sm ${tone.bg}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className={tone.text}>
          Trial {basketName ? `(${basketName}) ` : ""}expira em{" "}
          <strong>
            {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
          </strong>
          .
        </p>
        <Link
          href="/configuracoes/billing"
          className="rounded-pill border border-[color:var(--line-2)] px-3 py-1 text-xs font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          Escolher plano
        </Link>
      </div>
    </div>
  );
}
