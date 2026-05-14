"use client";

import { useEffect } from "react";

/**
 * Registra o service worker uma vez ao montar.
 * Silencia erros — SW é opcional, app funciona sem ele.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => {
        console.warn("[sw] register failed", err);
      });
  }, []);

  return null;
}
