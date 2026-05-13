"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import type { SocialPostRow } from "@/lib/queries/content";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const STATUS_META: Record<
  string,
  { label: string; tone: "good" | "warn" | "bad" | "accent" | "neutral" }
> = {
  idea: { label: "Ideia", tone: "neutral" },
  draft: { label: "Rascunho", tone: "neutral" },
  pending_approval: { label: "Aprovacao", tone: "warn" },
  approved: { label: "Aprovado", tone: "accent" },
  scheduled: { label: "Agendado", tone: "accent" },
  publishing: { label: "Publicando", tone: "warn" },
  published: { label: "Publicado", tone: "good" },
  failed: { label: "Falha", tone: "bad" },
  rejected: { label: "Rejeitado", tone: "bad" },
};

const PLATFORM_DOT: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  tiktok: "#000",
  youtube: "#FF0000",
  pinterest: "#E60023",
  threads: "#000",
  x: "#000",
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseMonth(param: string | null | undefined): Date {
  if (!param) return startOfMonth(new Date());
  const [y, m] = param.split("-").map(Number);
  if (!y || !m) return startOfMonth(new Date());
  return new Date(y, m - 1, 1);
}

function fmtMonthLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function postSlotDate(p: SocialPostRow): Date | null {
  const raw = p.scheduled_at ?? p.published_at ?? p.created_at;
  if (!raw) return null;
  return new Date(raw);
}

interface Props {
  posts: SocialPostRow[];
  monthParam?: string | null;
}

export function SocialCalendar({ posts, monthParam }: Props) {
  const [cursor, setCursor] = useState(parseMonth(monthParam));
  const [openDay, setOpenDay] = useState<string | null>(null);

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay();
    const start = new Date(first.getTime() - startWeekday * 864e5);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(start.getTime() + i * 864e5));
    }
    return cells;
  }, [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, SocialPostRow[]>();
    for (const p of posts) {
      const dt = postSlotDate(p);
      if (!dt) continue;
      const key = dt.toISOString().slice(0, 10);
      const arr = m.get(key) ?? [];
      arr.push(p);
      m.set(key, arr);
    }
    return m;
  }, [posts]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const monthIdx = cursor.getMonth();
  const openItems = openDay ? (byDay.get(openDay) ?? []) : [];

  return (
    <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
      <header className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          className="rounded-pill border border-[color:var(--line-2)] p-1.5 hover:bg-[color:var(--bg-2)]"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="text-sm font-medium capitalize">
          {fmtMonthLabel(cursor)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-pill border border-[color:var(--line-2)] px-3 py-1 text-xs font-medium hover:bg-[color:var(--bg-2)]"
          >
            Hoje
          </button>
          <button
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            className="rounded-pill border border-[color:var(--line-2)] p-1.5 hover:bg-[color:var(--bg-2)]"
            aria-label="Proximo mes"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-[color:var(--line)] bg-[color:var(--bg-2)]/40 text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-3 py-2 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const items = byDay.get(key) ?? [];
          const inMonth = d.getMonth() === monthIdx;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              onClick={() => items.length > 0 && setOpenDay(key)}
              className={`min-h-[110px] border-b border-r border-[color:var(--line)] p-2 text-left text-xs transition-colors ${
                inMonth
                  ? "bg-[color:var(--panel)]"
                  : "bg-[color:var(--bg-2)]/30 text-[color:var(--ink-4)]"
              } ${items.length > 0 ? "hover:bg-[color:var(--bg-2)]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    isToday
                      ? "bg-[color:var(--accent)] text-white"
                      : inMonth
                        ? "text-[color:var(--ink)]"
                        : ""
                  }`}
                >
                  {d.getDate()}
                </span>
                {items.length > 0 && (
                  <span className="font-mono text-[10px] text-[color:var(--ink-4)]">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="mt-1 space-y-0.5">
                {items.slice(0, 2).map((p) => {
                  const meta =
                    STATUS_META[p.status] ?? STATUS_META.draft;
                  const dt = postSlotDate(p);
                  const time = dt
                    ? dt.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] ${
                        meta.tone === "good"
                          ? "bg-[color:var(--good)]/10 text-[color:var(--good)]"
                          : meta.tone === "bad"
                            ? "bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                            : meta.tone === "warn"
                              ? "bg-[color:var(--warn)]/10 text-[color:var(--warn)]"
                              : meta.tone === "accent"
                                ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                                : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)]"
                      }`}
                    >
                      {time && <span className="font-mono">{time}</span>}
                      <span className="truncate">
                        {p.content_text?.slice(0, 28) || "Sem texto"}
                      </span>
                    </div>
                  );
                })}
                {items.length > 2 && (
                  <div className="text-[10px] text-[color:var(--ink-4)]">
                    + {items.length - 2}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {openDay && (
        <div
          onClick={() => setOpenDay(null)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
          >
            <header className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium capitalize">
                {new Date(openDay).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </div>
              <button
                onClick={() => setOpenDay(null)}
                className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              >
                Fechar
              </button>
            </header>
            <ul className="space-y-2">
              {openItems.map((p) => {
                const meta = STATUS_META[p.status] ?? STATUS_META.draft;
                const dt = postSlotDate(p);
                const plats = Array.isArray(p.platforms) ? p.platforms : [];
                const isAi = !p.created_by_user_id;
                return (
                  <li
                    key={p.id}
                    className="rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-[color:var(--ink-3)]">
                        <span className="font-mono">
                          {dt
                            ? dt.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                        {isAi && (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-[color:var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--accent)]">
                            <Sparkles className="h-2.5 w-2.5" /> IA
                          </span>
                        )}
                      </div>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm">
                      {p.content_text || (
                        <span className="text-[color:var(--ink-4)]">Sem texto</span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {plats.map((pl: string) => (
                          <span
                            key={pl}
                            className="inline-flex items-center gap-1 rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] uppercase"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: PLATFORM_DOT[pl] ?? "#999" }}
                            />
                            {pl}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/social/posts`}
                        className="inline-flex items-center gap-1 text-[11px] text-[color:var(--ink-3)] hover:text-[color:var(--accent)]"
                      >
                        Abrir <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
