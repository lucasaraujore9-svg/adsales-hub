# 042 — Email marketing dispatcher real (Resend)

**Tipo:** feature
**Severidade:** crítico
**Bloco:** C (Marketing)
**Dependências:** 006 (signature webhook)
**Esforço estimado:** L (24-40h)
**Status:** todo

## Contexto

`/marketing/emails` permite criar campanha com `status='scheduled'`, mas:
- Sem integração com Resend para envio em massa
- Sem cron que dispara
- Sem webhook que recebe métricas (open, click, bounce)
- Métricas mostradas (`open_rate`, `click_rate`) são mockadas

## Critérios de aceite

- [ ] Cron `email_dispatch` (a cada 1 min) busca campaigns com `status='scheduled'` e `scheduled_at <= now()`
- [ ] Resolve segmento → lista de contatos
- [ ] Envia em batches via Resend (rate limit aware)
- [ ] Marca cada envio em `email_sends` (id_externo, opened_at, clicked_at, bounced_at)
- [ ] Webhook `/api/webhooks/resend` recebe events e atualiza `email_sends`
- [ ] Métricas calculadas em tempo real (open_rate = opened/sent)
- [ ] Unsubscribe link automático em cada email (LGPD)
- [ ] Bounce hard → marca contato como `email_invalid`
- [ ] Campaign status: scheduled → sending → sent → completed (com métricas finais)

## Plan

1. Migração `supabase/migrations/00021_email_sends.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS email_sends (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workspace_id UUID NOT NULL REFERENCES workspaces(id),
     campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
     contact_id UUID REFERENCES contacts(id),
     to_email TEXT NOT NULL,
     external_id TEXT, -- Resend message id
     status TEXT NOT NULL DEFAULT 'queued', -- queued, sent, delivered, opened, clicked, bounced, complained, unsubscribed
     sent_at TIMESTAMPTZ,
     delivered_at TIMESTAMPTZ,
     opened_at TIMESTAMPTZ,
     first_clicked_at TIMESTAMPTZ,
     bounced_at TIMESTAMPTZ,
     bounce_type TEXT,
     unsubscribed_at TIMESTAMPTZ,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT now()
   );
   
   CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
   CREATE INDEX idx_email_sends_contact ON email_sends(contact_id);
   CREATE INDEX idx_email_sends_external ON email_sends(external_id);
   
   ALTER TABLE contacts
     ADD COLUMN IF NOT EXISTS email_invalid BOOLEAN DEFAULT FALSE,
     ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMPTZ;
   ```

2. Instalar Resend SDK:
   ```bash
   npm install resend
   ```

3. Criar `src/lib/email/resend.ts`:
   ```ts
   import { Resend } from 'resend';
   
   export function getResend(): Resend {
     const key = process.env.RESEND_API_KEY;
     if (!key) throw new Error('RESEND_API_KEY missing');
     return new Resend(key);
   }
   
   export async function sendEmail({ to, subject, html, from, replyTo, tags }) {
     const r = getResend();
     return r.emails.send({ from, to, subject, html, reply_to: replyTo, tags });
   }
   ```

4. Criar `src/lib/email/campaigns.ts`:
   ```ts
   export async function dispatchCampaign(admin, campaignId: string) {
     const { data: campaign } = await admin.from('email_campaigns')
       .select('*, workspace:workspaces(domain, name)').eq('id', campaignId).single();
     if (!campaign || campaign.status !== 'scheduled') return;
     
     await admin.from('email_campaigns').update({ status: 'sending' }).eq('id', campaignId);
     
     // Resolve segment
     const contacts = await resolveSegment(admin, campaign.workspace_id, campaign.segment_config);
     
     const fromAddress = `${campaign.workspace.name} <hi@${campaign.workspace.domain ?? 'adsaleshub.com'}>`;
     const batchSize = 50;
     for (let i = 0; i < contacts.length; i += batchSize) {
       const batch = contacts.slice(i, i + batchSize);
       await Promise.all(batch.map(async (c) => {
         if (c.email_invalid || c.email_unsubscribed_at) return;
         try {
           const html = renderEmailBody(campaign.content, c, { 
             unsubscribeUrl: `${appUrl}/unsubscribe?contact=${c.id}&token=${c.unsubscribe_token}` 
           });
           const res = await sendEmail({
             from: fromAddress,
             to: c.email,
             subject: campaign.subject,
             html,
             tags: [{ name: 'campaign_id', value: campaignId }],
           });
           await admin.from('email_sends').insert({
             workspace_id: campaign.workspace_id,
             campaign_id: campaignId,
             contact_id: c.id,
             to_email: c.email,
             external_id: res.data?.id,
             status: 'sent',
             sent_at: new Date().toISOString(),
           });
         } catch (e) {
           await admin.from('email_sends').insert({
             workspace_id: campaign.workspace_id,
             campaign_id: campaignId,
             contact_id: c.id,
             to_email: c.email,
             status: 'failed',
             metadata: { error: String(e) },
           });
         }
       }));
       // Respeitar rate limit Resend (10/s default)
       await new Promise(r => setTimeout(r, 5_000));
     }
     
     await admin.from('email_campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', campaignId);
   }
   ```

5. Atualizar [src/app/api/webhooks/resend/route.ts](../src/app/api/webhooks/resend/route.ts):
   - Após verificar signature (issue 006)
   - Para cada event type (`email.sent`, `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`):
     - Atualizar `email_sends` por `external_id`
     - Se `bounced` permanente → marcar `contacts.email_invalid = true`

6. Adicionar rota pública `/unsubscribe`:
   - GET com `?contact=X&token=Y`
   - Valida token (hash simples baseado em workspace_id + contact_id)
   - Marca `contacts.email_unsubscribed_at`
   - Confirmação visual

7. Adicionar task no cron:
   ```ts
   if (task === 'email_dispatch' || task === 'all') {
     const { data: scheduled } = await admin.from('email_campaigns')
       .select('id')
       .eq('status', 'scheduled')
       .lte('scheduled_at', new Date().toISOString());
     for (const c of scheduled ?? []) await dispatchCampaign(admin, c.id);
   }
   ```

8. Calcular métricas em tempo real:
   - Em `/marketing/emails` query computed: `open_rate = COUNT(opened_at) / COUNT(*)` agrupado por campaign

## Arquivos afetados

- `supabase/migrations/00021_email_sends.sql` (novo)
- `src/lib/email/resend.ts` (novo)
- `src/lib/email/campaigns.ts` (novo)
- `src/lib/email/segment.ts` (resolve segment_config → contacts)
- `src/app/api/webhooks/resend/route.ts`
- `src/app/api/cron/run/route.ts`
- `src/app/unsubscribe/page.tsx` (novo, público)
- `src/app/(main)/marketing/emails/page.tsx` (métricas reais)

## Como testar

1. Configurar `RESEND_API_KEY` em `.env.local`
2. Configurar webhook Resend → URL local via tunnel (ngrok)
3. Criar campaign de teste com 5 emails de teste
4. Trigger cron `?task=email_dispatch`
5. Resend dashboard mostra emails enviados
6. Abrir email recebido → após alguns segundos, `email_sends.opened_at` populado
7. Click no link → `first_clicked_at` populado
8. Click no unsubscribe → contato marcado, próxima campanha não envia

## Notas

- Resend tem rate limit (10/s no free, 100/s no pro). Respeitar.
- Considerar `react-email` para templates ricos
- Tracking de open requer pixel — Resend faz auto se `tracking: true`
- Unsubscribe é obrigatório (LGPD + CAN-SPAM)
- Em fase futura: A/B testing, send time optimization
