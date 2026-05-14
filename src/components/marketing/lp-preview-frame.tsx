"use client";

import { useState } from "react";
import { Smartphone, Tablet, Monitor } from "lucide-react";

type Viewport = "mobile" | "tablet" | "desktop";

const SIZES: Record<Viewport, { width: number; label: string; icon: typeof Smartphone }> = {
  mobile: { width: 375, label: "Mobile", icon: Smartphone },
  tablet: { width: 768, label: "Tablet", icon: Tablet },
  desktop: { width: 1280, label: "Desktop", icon: Monitor },
};

/**
 * Frame de preview com toggle entre mobile/tablet/desktop.
 * Renderiza um iframe com o URL público da LP.
 */
export function LpPreviewFrame({ url }: { url: string }) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const cfg = SIZES[viewport];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {(Object.keys(SIZES) as Viewport[]).map((v) => {
          const Icon = SIZES[v].icon;
          const active = v === viewport;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setViewport(v)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                active
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                  : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {SIZES[v].label}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-[color:var(--ink-4)]">{cfg.width}px</span>
      </div>
      <div className="flex justify-center rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-6">
        <div
          style={{ width: cfg.width, maxWidth: "100%" }}
          className="overflow-hidden rounded-md border border-[color:var(--line-2)] bg-white shadow-lg"
        >
          <div className="flex items-center gap-1.5 border-b border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--bad)]/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--warn)]/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--good)]/60" />
            <span className="ml-3 truncate text-xs text-[color:var(--ink-3)]">{url}</span>
          </div>
          <iframe
            src={url}
            title="Preview"
            className="block h-[600px] w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
