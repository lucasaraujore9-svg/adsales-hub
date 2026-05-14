"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Building2, Search, User } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { NAV_SECTIONS } from "@/components/layout/sidebar-nav-config";
import { searchGlobal, type SearchResult } from "@/lib/actions/search";
import { dealStatusLabel } from "@/lib/labels";

const RECENT_KEY = "adsales:search:recent";
const MAX_RECENT = 5;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(term: string) {
  if (typeof window === "undefined" || !term.trim()) return;
  try {
    const list = loadRecent().filter((t) => t !== term);
    list.unshift(term);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setRecent(loadRecent());
  }, [open]);

  // Debounce 300ms
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const r = await searchGlobal(query);
        setResults(r);
      } catch {
        setResults({ contacts: [], deals: [], companies: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function go(href: string, term?: string) {
    setOpen(false);
    if (term) pushRecent(term);
    router.push(href);
  }

  const hasData =
    !!results &&
    (results.contacts.length > 0 ||
      results.deals.length > 0 ||
      results.companies.length > 0);

  const navItems = useMemo(
    () => NAV_SECTIONS.flatMap((s) => s.items),
    [],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-full max-w-sm items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] px-3 text-xs text-[color:var(--ink-3)] transition-colors hover:border-[color:var(--line-2)] md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Buscar negócios, contatos, empresas...</span>
        <kbd className="rounded border border-[color:var(--line-2)] px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar contatos, negócios, empresas ou menu..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.trim().length < 2 && recent.length > 0 && (
            <CommandGroup heading="Recentes">
              {recent.map((r) => (
                <CommandItem key={r} onSelect={() => setQuery(r)}>
                  <Search className="mr-2 h-4 w-4 text-[color:var(--ink-4)]" />
                  {r}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {loading && (
            <div className="px-4 py-3 text-xs text-[color:var(--ink-3)]">
              Buscando...
            </div>
          )}

          {!loading && query.trim().length >= 2 && !hasData && (
            <CommandEmpty>Nada encontrado para &quot;{query}&quot;.</CommandEmpty>
          )}

          {results && results.contacts.length > 0 && (
            <CommandGroup heading="Contatos">
              {results.contacts.map((c) => (
                <CommandItem
                  key={`c-${c.id}`}
                  onSelect={() => go(`/contatos?q=${encodeURIComponent(c.email ?? c.name)}`, query)}
                >
                  <User className="mr-2 h-4 w-4 text-[color:var(--ink-4)]" />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-[color:var(--ink-4)]">
                    {c.email ?? c.phone ?? ""}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results && results.deals.length > 0 && (
            <CommandGroup heading="Negócios">
              {results.deals.map((d) => (
                <CommandItem
                  key={`d-${d.id}`}
                  onSelect={() => go(`/negocios/${d.id}`, query)}
                >
                  <Briefcase className="mr-2 h-4 w-4 text-[color:var(--ink-4)]" />
                  <span className="flex-1">{d.title}</span>
                  <span className="text-xs text-[color:var(--ink-4)]">
                    {dealStatusLabel(d.status)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results && results.companies.length > 0 && (
            <CommandGroup heading="Empresas">
              {results.companies.map((co) => (
                <CommandItem
                  key={`co-${co.id}`}
                  onSelect={() => go(`/contatos?q=${encodeURIComponent(co.name)}`, query)}
                >
                  <Building2 className="mr-2 h-4 w-4 text-[color:var(--ink-4)]" />
                  <span className="flex-1">{co.name}</span>
                  <span className="text-xs text-[color:var(--ink-4)]">
                    {co.website ?? ""}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Navegação">
            {navItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => go(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4 text-[color:var(--ink-4)]" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
