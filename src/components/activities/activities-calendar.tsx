"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ActivityRow, ContactRow, DealRow } from "@/lib/queries/crm";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseMonth(param: string | null): Date {
  if (!param) return startOfMonth(new Date());
  const [y, m] = param.split("-").map(Number);
  if (!y || !m) return startOfMonth(new Date());
  return new Date(y, m - 1, 1);
}

function fmtMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtMonthLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

interface Props {
  activities: ActivityRow[];
  deals: DealRow[];
  contacts: ContactRow[];
  monthParam: string | null;
}

export function ActivitiesCalendar({ activities, deals, contacts, monthParam }: Props) {
  const initial = parseMonth(monthParam);
  const [cursor, setCursor] = useState(initial);
  const [openDay, setOpenDay] = useState<string | null>(null);

  const dealById = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);
  const contactById = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);

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
    const m = new Map<string, ActivityRow[]>();
    for (const a of activities) {
      if (!a.due_date) continue;
      const key = new Date(a.due_date).toISOString().slice(0, 10);
      const arr = m.get(key) ?? [];
      arr.push(a);
      m.set(key, arr);
    }
    return m;
  }, [activities]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const monthIdx = cursor.getMonth();
  const openItems = openDay ? (byDay.get(openDay) ?? []) : [];

  return (
    <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
      <header className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="rounded-pill border border-[color:var(--line-2)] p-1.5 hover:bg-[color:var(--bg-2)]"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="text-sm font-medium capitalize">{fmtMonthLabel(cursor)}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-pill border border-[color:var(--line-2)] px-3 py-1 text-xs font-medium hover:bg-[color:var(--bg-2)]"
          >
            Hoje
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
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
          const open = items.filter((a) => !a.completed).length;
          const overdue = items.filter(
            (a) =>
              !a.completed &&
              a.due_date &&
              new Date(a.due_date).getTime() < Date.now() &&
              key !== todayKey,
          ).length;

          return (
            <button
              key={key}
              onClick={() => items.length > 0 && setOpenDay(key)}
              className={`min-h-[88px] border-b border-r border-[color:var(--line)] p-2 text-left text-xs transition-colors ${
                inMonth ? "bg-[color:var(--panel)]" : "bg-[color:var(--bg-2)]/30 text-[color:var(--ink-4)]"
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
                {items.slice(0, 2).map((a) => (
                  <div
                    key={a.id}
                    className={`truncate rounded-md px-1.5 py-0.5 text-[10px] ${
                      a.completed
                        ? "bg-[color:var(--bg-2)] text-[color:var(--ink-4)] line-through"
                        : overdue > 0
                          ? "bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                          : "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                    }`}
                  >
                    {a.title}
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-[10px] text-[color:var(--ink-4)]">
                    + {items.length - 2}
                  </div>
                )}
                {items.length === 0 && open === 0 && null}
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
            className="w-full max-w-md rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
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
              {openItems.map((a) => {
                const contact = a.contact_id ? contactById.get(a.contact_id) : null;
                const deal = a.deal_id ? dealById.get(a.deal_id) : null;
                return (
                  <li
                    key={a.id}
                    className="rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3"
                  >
                    <div
                      className={`text-sm ${a.completed ? "text-[color:var(--ink-4)] line-through" : "font-medium"}`}
                    >
                      {a.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[color:var(--ink-3)]">
                      <span>
                        {a.due_date
                          ? new Date(a.due_date).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                      <span>· {a.type}</span>
                      {contact && <span>· {contact.name}</span>}
                      {deal && <span className="truncate">· {deal.title}</span>}
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
