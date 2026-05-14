# 061 — Sumário acionável de calls com IA

**Tipo:** feature
**Severidade:** alto
**Bloco:** E (SDR/Voz) / A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Análise de calls em [src/app/(main)/analise-calls/page.tsx](../src/app/(main)/analise-calls/page.tsx) mostra só score + frase resumo + sentiment. Não há:
- O que o lead pediu/objetou
- Próxima ação recomendada
- Coaching para o vendedor
- Botão "criar tarefa de follow-up"

Tabela `call_analyses` tem campos `objections`, `strengths`, `opportunities` mas não são renderizados.

## Critérios de aceite

- [ ] UI mostra para cada call:
  - Score 0-10 + verdict
  - Resumo executivo (1-2 frases)
  - O que ele quer (lista bullet)
  - Objeções identificadas
  - Próxima ação recomendada (com botão "Criar tarefa")
  - Coaching: o que vendedor fez bem / pode melhorar
  - Sentiment timeline (variação ao longo da call)
  - Player de áudio (se gravação disponível)
  - Transcrição expansível
- [ ] Botão "Criar tarefa" cria activity vinculada ao deal
- [ ] Botão "Mover deal para X" (se sugestão indica)
- [ ] Análise IA pode ser disparada manualmente ("Reanalisar")

## Plan

1. Atualizar prompt em `src/lib/ai/call-analysis.ts` para retornar JSON estruturado:
   ```ts
   {
     score: number, // 0-10
     verdict: 'qualified' | 'not_qualified' | 'follow_up' | 'inconclusive',
     summary: "string curta",
     wants: ["string", "string"], // pedidos do lead
     objections: [{ text: "string", severity: 'low'|'med'|'high' }],
     next_action: {
       type: 'send_proposal' | 'schedule_meeting' | 'send_info' | 'no_action',
       description: "string",
       due_in_hours: number
     },
     coaching: {
       strengths: ["string"],
       improvements: ["string"]
     },
     sentiment_timeline: [{ start_seconds: number, sentiment: 'positive'|'neutral'|'negative' }]
   }
   ```

2. Migração `supabase/migrations/00025_call_analysis_extras.sql`:
   ```sql
   ALTER TABLE call_analyses
     ADD COLUMN IF NOT EXISTS wants JSONB DEFAULT '[]',
     ADD COLUMN IF NOT EXISTS next_action JSONB,
     ADD COLUMN IF NOT EXISTS sentiment_timeline JSONB DEFAULT '[]';
   ```

3. Atualizar componente `src/components/calls/call-analysis-card.tsx`:
   - Renderiza todos os campos
   - Sentiment timeline como bar chart simples (positive=verde, negative=vermelho)
   - Player HTML5 `<audio src={call.recording_url}>` se disponível
   - Transcrição em `<details>` colapsável

4. Action `createTaskFromCallAnalysis(callId)`:
   - Lê `next_action` da análise
   - Cria activity com `due_at = now() + due_in_hours`
   - Vincula ao deal e contact da call

5. Action `reanalyzeCall(callId)`:
   - Chama análise IA novamente (custo!)
   - Atualiza registro

## Arquivos afetados

- `supabase/migrations/00025_call_analysis_extras.sql` (novo)
- `src/lib/ai/call-analysis.ts`
- `src/components/calls/call-analysis-card.tsx` (novo ou refatorar)
- `src/lib/actions/calls.ts` (novo)
- `src/app/(main)/analise-calls/page.tsx`

## Como testar

1. Subir gravação de call (ou usar uma já analisada)
2. Análise mostra: 5 wants, 2 objeções, próxima ação
3. Click "Criar tarefa" → activity criada com due date sugerido
4. Click "Reanalisar" → re-roda análise (mostra spinner)
5. Sentiment timeline visível como barras

## Notas

- Análise IA é cara: cachear em `call_analyses` table
- Não reanalisar sem confirmação (custo)
- Considerar tags por objeção comum (preço, prazo, autoridade) — útil para análise agregada futura
