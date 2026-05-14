# 011 — Consentimento LGPD em gravação de call IA

**Tipo:** compliance
**Severidade:** crítico
**Bloco:** E (SDR/Voz)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

LGPD Art. 7º + 11º exige consentimento explícito antes de gravar voz. O motor de voz IA do AdSales Hub grava ligações sem perguntar ao interlocutor.

Risco: multa ANPD até R$ 50M ou 2% do faturamento.

## Critérios de aceite

- [ ] Prompt do assistente IA inclui pergunta de consentimento na primeira mensagem
- [ ] Resposta do interlocutor é detectada e logada
- [ ] Se recusa → IA encerra cordialmente, não grava
- [ ] Se aceita → grava normalmente, marca `consent_recorded=true`
- [ ] Coluna `consent_recorded` em `sdr_calls`
- [ ] Coluna `consent_text` (texto exato dito pelo cliente)
- [ ] Coluna `recording_retention_until` (data limite — padrão 90 dias)
- [ ] Job cron limpa `recording_url` após retenção
- [ ] UI mostra status de consentimento em cada call

## Plan

1. Migração `supabase/migrations/00013_call_consent.sql`:
   ```sql
   ALTER TABLE sdr_calls
     ADD COLUMN IF NOT EXISTS consent_recorded BOOLEAN DEFAULT FALSE,
     ADD COLUMN IF NOT EXISTS consent_text TEXT,
     ADD COLUMN IF NOT EXISTS recording_retention_until TIMESTAMPTZ;
   
   CREATE INDEX IF NOT EXISTS idx_sdr_calls_retention
     ON sdr_calls(recording_retention_until)
     WHERE recording_url IS NOT NULL;
   ```

2. Atualizar [src/lib/telephony/assistants.ts](../src/lib/telephony/assistants.ts) para incluir prompt de consentimento:
   ```ts
   const CONSENT_PROMPT = `IMPORTANTE: Comece SEMPRE a ligação dizendo:
   "Olá, aqui é a [nome do agente] da [empresa]. Antes de prosseguirmos, 
   informo que esta chamada será gravada para fins de qualidade. 
   Você concorda?"
   
   - Se a pessoa disser SIM (sim, claro, ok, pode, tudo bem, concordo) → 
     prossiga normalmente.
   - Se a pessoa disser NÃO (não, não quero, prefiro que não) → 
     responda: "Sem problemas. Posso te enviar mais informações por 
     email ou WhatsApp?" e encerre cordialmente.
   - Após resposta, registre no campo extracted_data: 
     { "consent": "yes" | "no", "consent_text": "<resposta exata>" }
   `;
   ```

3. Atualizar webhook [src/lib/telephony/webhook.ts](../src/lib/telephony/webhook.ts) (handler de end-of-call):
   - Ler `extracted_data.consent` da análise
   - Se `consent === 'no'`: 
     - Setar `consent_recorded = false`, `recording_url = null`
     - Não baixar/armazenar áudio
   - Se `consent === 'yes'`:
     - Setar `consent_recorded = true`, `consent_text = ...`
     - `recording_retention_until = now() + 90 days`
   - Caso ambíguo: marcar para revisão humana

4. Atualizar UI `/prospeccao/sdr-ia` para mostrar badge:
   - "✓ Consentido" verde
   - "✗ Recusou gravação" cinza
   - "⚠ Pendente revisão" amarelo

5. Adicionar task cron `recording_purge` em [src/app/api/cron/run/route.ts](../src/app/api/cron/run/route.ts):
   ```ts
   async function runRecordingPurge() {
     const admin = createAdminSupabaseClient();
     const { data: expired } = await admin
       .from('sdr_calls')
       .select('id, recording_url')
       .lt('recording_retention_until', new Date().toISOString())
       .not('recording_url', 'is', null);
     for (const c of expired ?? []) {
       // Remove do storage
       await admin.storage.from('call-recordings').remove([c.recording_url]);
       await admin
         .from('sdr_calls')
         .update({ recording_url: null, recording_purged_at: new Date().toISOString() })
         .eq('id', c.id);
     }
   }
   ```

## Arquivos afetados

- `supabase/migrations/00013_call_consent.sql` (novo)
- `src/lib/telephony/assistants.ts`
- `src/lib/telephony/webhook.ts`
- `src/app/(main)/prospeccao/sdr-ia/page.tsx` (badge)
- `src/app/api/cron/run/route.ts` (purge task)

## Como testar

1. Configurar workspace com SDR IA
2. Disparar call de teste — ouvir abertura: pergunta de consentimento
3. Responder "Sim, claro" → após call, banco mostra `consent_recorded=true`
4. Repetir teste, responder "Prefiro que não" → call encerra, `consent_recorded=false`, `recording_url=null`
5. Forçar `recording_retention_until` para o passado:
   ```sql
   UPDATE sdr_calls SET recording_retention_until = '2024-01-01' WHERE id = '...';
   ```
6. Disparar cron `?task=recording_purge` → recording removido do storage e DB

## Notas

- Esse fluxo cobre LGPD básico; consultar jurídico se for vender pra setores regulados (saúde, financeiro)
- Considerar exportação de gravações para o titular (Art. 18) em fase futura
- "Consentimento" deve ser auditável — não modificar `consent_text` depois
- 90 dias é razoável; tornar configurável por workspace em `sdr_configs.recording_retention_days`
