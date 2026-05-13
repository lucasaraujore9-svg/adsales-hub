"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const [unread] = useState(0); // wired up later in issue 067

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--line-2)] hover:text-[color:var(--ink)]"
          aria-label="Notificacoes"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full border-0 bg-[color:var(--accent)] px-1 text-[10px] text-white"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-4 py-3">
          <span className="text-sm font-medium">Notificacoes</span>
          <button className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]">
            Marcar como lidas
          </button>
        </div>
        <div className="p-6 text-center text-xs text-[color:var(--ink-3)]">
          Nenhuma notificacao ainda. Elas aparecem aqui em tempo real assim que
          algo relevante acontece.
        </div>
      </PopoverContent>
    </Popover>
  );
}
