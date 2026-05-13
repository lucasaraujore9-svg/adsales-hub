"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  NAV_SECTIONS,
  FOOTER_NAV,
} from "@/components/layout/sidebar-nav-config";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  activeModules: string[];
  workspaceName: string;
  logoUrl?: string | null;
}

export function Sidebar({ activeModules, workspaceName, logoUrl }: Props) {
  const { collapsed, toggle } = useSidebar();

  return (
    <TooltipProvider>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "hidden h-full shrink-0 border-r border-[color:var(--line)] bg-[color:var(--bg)] transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--line)] px-3">
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-2 overflow-hidden",
              collapsed && "justify-center",
            )}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={workspaceName}
                className="h-6 w-6 shrink-0 rounded-md object-cover"
              />
            ) : (
              <span className="inline-block h-6 w-6 shrink-0 rounded-md bg-[color:var(--accent)]" />
            )}
            {!collapsed && (
              <span className="truncate text-sm font-medium">{workspaceName}</span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--ink-3)] hover:bg-[color:var(--bg-2)] hover:text-[color:var(--ink)]"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-4 px-2 py-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="flex flex-col gap-0.5">
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    activeModules={activeModules}
                  />
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="shrink-0 border-t border-[color:var(--line)] bg-[color:var(--bg)] px-2 py-2">
          {FOOTER_NAV.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              activeModules={activeModules}
            />
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
}
