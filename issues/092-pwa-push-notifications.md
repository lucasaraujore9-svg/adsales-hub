# 092 — Service worker + Web Push notifications

**Tipo:** feature
**Severidade:** alto
**Bloco:** Mobile
**Dependências:** nenhuma
**Esforço estimado:** L (24-40h)
**Status:** todo

## Contexto

`/public/manifest.json` existe mas sem service worker, sem push notifications, sem offline. Em mobile, vendedor não recebe alerta de "novo lead" quando app está fechado.

## Critérios de aceite

- [ ] Service worker registrado em `/sw.js`
- [ ] PWA instalável (Add to Home Screen)
- [ ] Web Push: usuário pode opt-in
- [ ] Notificações enviadas para eventos: novo lead, deal won, mensagem inbox, atividade vencendo
- [ ] Configurar quais eventos notificam (preferences por user)
- [ ] Cache de assets estáticos (offline mínimo: leitura)
- [ ] Badge no ícone com contador de não-lidos (PWA Badging API)

## Plan

1. Criar `public/sw.js` (service worker):
   ```js
   const CACHE = 'adsales-v1';
   const ASSETS = ['/manifest.json', '/icons/192.png', '/icons/512.png'];
   
   self.addEventListener('install', (e) => {
     e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
   });
   
   self.addEventListener('activate', (e) => {
     e.waitUntil(self.clients.claim());
   });
   
   self.addEventListener('push', (e) => {
     const data = e.data?.json() ?? {};
     e.waitUntil(self.registration.showNotification(data.title ?? 'AdSales Hub', {
       body: data.body,
       icon: '/icons/192.png',
       badge: '/icons/badge.png',
       data: { url: data.url ?? '/' },
       tag: data.tag,
     }));
   });
   
   self.addEventListener('notificationclick', (e) => {
     e.notification.close();
     e.waitUntil(self.clients.openWindow(e.notification.data.url));
   });
   ```

2. Registrar SW no app:
   - `src/components/pwa/sw-register.tsx` (client component em layout)
   ```tsx
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.register('/sw.js');
     }
   }, []);
   ```

3. Subscription push:
   - Gerar VAPID keys (uma vez): `npx web-push generate-vapid-keys`
   - Salvar em env: `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`
   - Componente `<EnableNotificationsButton>`:
     ```tsx
     async function subscribe() {
       const reg = await navigator.serviceWorker.ready;
       const sub = await reg.pushManager.subscribe({
         userVisibleOnly: true,
         applicationServerKey: urlB64ToUint8(VAPID_PUBLIC),
       });
       await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
     }
     ```

4. Migração `supabase/migrations/00031_push_subscriptions.sql`:
   ```sql
   CREATE TABLE push_subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES profiles(id),
     endpoint TEXT NOT NULL,
     p256dh TEXT NOT NULL,
     auth TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE (endpoint)
   );
   ```

5. API `POST /api/push/subscribe` salva em DB

6. Função `sendPushToUser(userId, payload)`:
   ```ts
   import webpush from 'web-push';
   webpush.setVapidDetails('mailto:noreply@adsaleshub.com', VAPID_PUBLIC, VAPID_PRIVATE);
   
   const { data: subs } = await admin.from('push_subscriptions').select('*').eq('user_id', userId);
   await Promise.all(subs.map(s => webpush.sendNotification({
     endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth }
   }, JSON.stringify(payload)).catch(e => {
     if (e.statusCode === 410) admin.from('push_subscriptions').delete().eq('id', s.id);
   })));
   ```

7. Triggers de notificação:
   - Em `dispatchWebhook('lead.captured')` → também `sendPushToUser(workspaceOwners, ...)`
   - Em `deal.won` → push para owner
   - Em inbox `ingest` → push para assignee

8. UI `/configuracoes/notificacoes`:
   - Switches para cada tipo de notificação
   - "Ativar push" se ainda não fez

## Arquivos afetados

- `public/sw.js` (novo)
- `public/icons/badge.png` (novo)
- `src/components/pwa/sw-register.tsx` (novo)
- `src/components/pwa/enable-notifications-button.tsx` (novo)
- `supabase/migrations/00031_push_subscriptions.sql` (novo)
- `src/app/api/push/subscribe/route.ts` (novo)
- `src/lib/notifications/push.ts` (novo)
- `src/app/(main)/configuracoes/notificacoes/page.tsx` (novo)
- `package.json` (web-push)

## Como testar

1. Acessar via HTTPS (requirement para SW)
2. DevTools → Application → SW registrado
3. Click "Ativar notificações" → browser pede permissão
4. Permitir → registra subscription no DB
5. Disparar webhook lead.captured → notification aparece
6. Click → abre app na URL
7. Mobile (Chrome Android): "Add to Home Screen" funciona
8. App abre standalone

## Notas

- iOS Safari: Web Push só desde iOS 16.4+
- Android: full support
- VAPID keys NUNCA commitadas no git
- Considerar lib `web-push` para envio do servidor
- Em fase futura: FCM/APNs para app nativo
