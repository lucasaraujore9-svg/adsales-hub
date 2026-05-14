/* AdSales Hub — Service Worker
 *
 * Estratégia mínima:
 * - Recebe push e exibe notificação
 * - Click abre URL fornecida ou foca aba existente
 * - Sem cache offline complexo (apenas registro)
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: event.data.text() };
  }
  const title = data.title || "AdSales Hub";
  const options = {
    body: data.body || "",
    icon: data.icon || "/brand-assets/png/icon-192.png",
    badge: data.badge || "/brand-assets/png/icon-192.png",
    tag: data.tag,
    data: { url: data.url || "/" },
    requireInteraction: !!data.requireInteraction,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    }),
  );
});
