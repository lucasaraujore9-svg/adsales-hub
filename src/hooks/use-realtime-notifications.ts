"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface RealtimeNotification {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  channel: "deal" | "campaign" | "post" | "system";
}

/**
 * Simple Realtime subscription. Listens to postgres INSERT events on a few key
 * tables (deals, ai_insights, social_posts) for the current workspace.
 *
 * The returned notifications array is kept in memory for the current browser
 * tab only — persistent notification history can be added later by writing
 * into a dedicated `notifications` table.
 */
export function useRealtimeNotifications(workspaceId: string | null) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    const supabase = createClient();
    supabaseRef.current = supabase;

    const channel = supabase
      .channel(`ws-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "deals",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: { new: { id: string; title?: string; source?: string; value?: number } }) => {
          setNotifications((prev) => [
            {
              id: payload.new.id,
              title: `Novo negocio: ${payload.new.title ?? "sem titulo"}`,
              description: payload.new.source
                ? `Origem ${payload.new.source}`
                : undefined,
              createdAt: new Date().toISOString(),
              channel: "deal" as const,
            },
            ...prev,
          ].slice(0, 50));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_insights",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload: { new: { id: string; title?: string; severity?: string } }) => {
          setNotifications((prev) => [
            {
              id: payload.new.id,
              title: `Insight IA: ${payload.new.title ?? ""}`,
              description: `severidade ${payload.new.severity ?? "—"}`,
              createdAt: new Date().toISOString(),
              channel: "system" as const,
            },
            ...prev,
          ].slice(0, 50));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  return notifications;
}
