"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NAV_SECTIONS, FOOTER_NAV } from "@/components/layout/sidebar-nav-config";
import { SidebarItem } from "@/components/layout/sidebar-item";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  activeModules: string[];
  workspaceName: string;
}

export function MobileDrawer({ activeModules, workspaceName }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[color:var(--ink-2)] hover:bg-[color:var(--bg-2)] md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-[color:var(--line)] px-4">
          <SheetTitle asChild>
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded-md bg-[color:var(--accent)]" />
              <span className="truncate text-sm font-medium">{workspaceName}</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <TooltipProvider>
          <nav className="flex flex-col gap-4 overflow-y-auto px-2 py-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="flex flex-col gap-0.5">
                <div className="px-3 pb-1 text-[10px] font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                  {section.label}
                </div>
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    collapsed={false}
                    activeModules={activeModules}
                  />
                ))}
              </div>
            ))}
            <div className="mt-2 border-t border-[color:var(--line)] pt-3">
              {FOOTER_NAV.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  collapsed={false}
                  activeModules={activeModules}
                />
              ))}
            </div>
          </nav>
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}
