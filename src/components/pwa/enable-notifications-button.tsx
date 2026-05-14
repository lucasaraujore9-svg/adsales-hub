"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Permission = "default" | "granted" | "denied";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Botão de ativar notificações push.
 *
 * Estados:
 * - default: pede permissão + subscribe
 * - granted: já ativado (mostra "Ativadas") + permite desativar
 * - denied: bloqueado pelo browser (mostra instrução)
 *
 * Requer `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` configurada (VAPID).
 */
export function EnableNotificationsButton() {
  const [permission, setPermission] = useState<Permission>("default");
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission as Permission);
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub)),
    );
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const vapidPublic = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
      if (!vapidPublic) {
        toast.error(
          "Notificações push não estão configuradas neste workspace. Contate o admin.",
        );
        return;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm as Permission);
      if (perm !== "granted") {
        toast.error("Permissão negada pelo navegador.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const keyBytes = urlBase64ToUint8Array(vapidPublic);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes.buffer.slice(
          keyBytes.byteOffset,
          keyBytes.byteOffset + keyBytes.byteLength,
        ) as ArrayBuffer,
      });

      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) throw new Error("server error");
      setSubscribed(true);
      toast.success("Notificações ativadas!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao ativar notificações");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Notificações desativadas");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <p className="text-xs text-[color:var(--ink-4)]">
        Seu navegador não suporta notificações push.
      </p>
    );
  }

  if (permission === "denied") {
    return (
      <p className="text-xs text-[color:var(--warn)]">
        Notificações bloqueadas pelo navegador. Permita nas configurações do site para ativar.
      </p>
    );
  }

  if (subscribed) {
    return (
      <Button variant="outline" size="sm" onClick={disable} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <BellOff className="mr-1 h-4 w-4" />
        )}
        Desativar notificações
      </Button>
    );
  }

  return (
    <Button onClick={enable} disabled={loading} size="sm">
      {loading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Bell className="mr-1 h-4 w-4" />
      )}
      Ativar notificações
    </Button>
  );
}
