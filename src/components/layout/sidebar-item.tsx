"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/layout/sidebar-nav-config";
import { MODULE_LABELS } from "@/components/layout/sidebar-nav-config";

interface Props {
  item: NavItem;
  collapsed: boolean;
  activeModules: string[];
}

export function SidebarItem({ item, collapsed, activeModules }: Props) {
  const pathname = usePathname();
  const Icon = item.icon;
  const locked = item.module ? !activeModules.includes(item.module) : false;
  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname?.startsWith(item.href + "/"));

  const href = locked ? `/upgrade?module=${item.module}&from=${item.href}` : item.href;

  const content = (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
          : "text-[color:var(--ink-2)] hover:bg-[color:var(--bg-2)] hover:text-[color:var(--ink)]",
        locked && "opacity-70",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="flex-1 truncate font-medium">{item.label}</span>
      )}
      {!collapsed && locked && <Lock className="h-3 w-3 text-[color:var(--ink-4)]" />}
      {active && !collapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[color:var(--accent)]" />
      )}
    </Link>
  );

  if (!collapsed && !locked) return content;

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">
        {locked
          ? `${item.label} · disponivel no modulo ${MODULE_LABELS[item.module!] ?? item.module}`
          : item.label}
      </TooltipContent>
    </Tooltip>
  );
}
