# 060 — DNC list + horário comercial enforcement no SDR IA

**Tipo:** compliance
**Severidade:** crítico
**Bloco:** E (SDR/Voz)
**Dependências:** nenhuma
**Esforço estimado:** M (8-12h)
**Status:** todo

## Contexto

`sdr_configs` tem campo `working_hours` mas é ignorado no momento de discar. Não há `do_not_call_list` que bloqueia leads que pediram pra não ligar. Risco Anatel + LGPD.

## Critérios de aceite

- [ ] Tabela `do_not_call_list` (workspace_id, phone, reason, source, created_at)
- [ ] Antes de iniciar outbound: checa DNC + horário comercial
- [ ] Se phone está em DNC → não disca, marca queue entry como skipped
- [ ] Fora de horário → adia para próximo horário válido
- [ ] Lead que diz "não me ligue mais" durante call → adicionado em DNC automaticamente (via análise IA)
- [ ] UI em `/configuracoes/sdr-ia` para gerenciar DNC manualmente
- [ ] Endpoint público para auto-adição (link em email "remover do contato")
- [ ] Limite máximo de tentativas por lead (configurável, default 3)

## Plan

1. Migração `supabase/migrations/00024_dnc_list.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS do_not_call_list (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workspace_id UUID NOT NULL REFERENCES workspaces(id),
     phone TEXT NOT NULL, -- normalized format
     reason TEXT,
     source TEXT NOT NULL, -- 'manual', 'self_request', 'call_request', 'bounced_max_attempts'
     contact_id UUID REFERENCES contacts(id),
     added_by_user_id UUID REFERENCES profiles(id),
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE (workspace_id, phone)
   );
   
   CREATE INDEX idx_dnc_workspace_phone ON do_not_call_list(workspace_id, phone);
   ```

2. Helper `src/lib/telephony/compliance.ts`:
   ```ts
   export async function isInDNC(sb, workspaceId: string, phone: string): Promise<boolean> {
     const normalized = normalizePhone(phone);
     const { data } = await sb.from('do_not_call_list')
       .select('id')
       .eq('workspace_id', workspaceId)
       .eq('phone', normalized)
       .maybeSingle();
     return !!data;
   }
   
   export function isWithinWorkingHours(workingHours: any, now = new Date()): boolean {
     // workingHours = { timezone: 'America/Sao_Paulo', mon: ['09:00','18:00'], tue: [...], ... }
     const tz = workingHours?.timezone ?? 'America/Sao_Paulo';
     const day = ['sun','mon','tue','wed','thu','fri','sat'][new Date(now.toLocaleString('en', { timeZone: tz })).getDay()];
     const range = workingHours?.[day];
     if (!range || range.length !== 2) return false;
     const localTime = new Date(now.toLocaleString('en', { timeZone: tz }));
     const hh = String(localTime.getHours()).padStart(2, '0');
     const mm = String(localTime.getMinutes()).padStart(2, '0');
     const t = `${hh}:${mm}`;
     return t >= range[0] && t <= range[1];
   }
   
   export function nextValidTime(workingHours: any, now = new Date()): Date {
     // retorna próximo timestamp dentro de horário válido
   }
   ```

3. Em `src/lib/telephony/client.ts` (ou onde discagem é iniciada), antes do POST:
   ```ts
   if (await isInDNC(sb, workspaceId, phone)) {
     await sb.from('sdr_queue').update({ status: 'skipped_dnc' }).eq('id', queueId);
     return { skipped: true, reason: 'dnc' };
   }
   const { data: cfg } = await sb.from('sdr_configs').select('working_hours, max_attempts').eq('workspace_id', workspaceId).single();
   if (!isWithinWorkingHours(cfg.working_hours)) {
     const next = nextValidTime(cfg.working_hours);
     await sb.from('sdr_queue').update({ next_attempt_at: next.toISOString() }).eq('id', queueId);
     return { skipped: true, reason: 'outside_hours' };
   }
   ```

4. Auto-add ao DNC quando IA detecta pedido:
   - Atualizar prompt do assistente para extrair `extracted_data.dnc_request: boolean`
   - No webhook end-of-call: se true, adicionar ao DNC com source='call_request'

5. Auto-add quando exceder max_attempts:
   - No queue retry, se `attempts_made >= max_attempts`: marcar `status='exhausted'` e adicionar ao DNC com source='bounced_max_attempts'

6. UI:
   - `/configuracoes/sdr-ia/dnc` lista DNC com filtro/busca
   - Botão "Adicionar manualmente" (phone + reason)
   - Botão "Remover" (com confirmação)
   - Import CSV (futuro)

7. Rota pública `/dnc/remover-me?token=X` (link em footer de email/WhatsApp):
   - Token válido = adiciona ao DNC do workspace
   - Confirmação visual

## Arquivos afetados

- `supabase/migrations/00024_dnc_list.sql` (novo)
- `src/lib/telephony/compliance.ts` (novo)
- `src/lib/telephony/client.ts` (check antes de discar)
- `src/lib/telephony/webhook.ts` (auto-add)
- `src/app/(main)/configuracoes/sdr-ia/dnc/page.tsx` (novo)
- `src/app/dnc/remover-me/page.tsx` (novo, público)

## Como testar

1. Cadastrar phone no DNC manualmente
2. Tentar discar para esse número via fila → skipped, não disca
3. Configurar `working_hours.mon=['09:00','18:00']`
4. Tentar discar segunda 22:00 → adiado para terça 09:00
5. Em call, dizer "Não quero ser chamado" → após call, phone aparece no DNC
6. Lead com 3 falhas → adicionado ao DNC

## Notas

- `phone` no DNC é normalizado (remover formatação)
- Não compartilhar DNC entre workspaces (cliente A vs B)
- Considerar lista nacional Procon-DNS em fase futura
- Documentar em Política de Privacidade
