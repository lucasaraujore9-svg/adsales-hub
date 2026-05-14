# 093 — Email digest semanal

**Tipo:** feature
**Severidade:** médio
**Bloco:** D (Analytics) / Notificações
**Dependências:** 042 (email dispatcher)
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Vendedor/gerente quer resumo semanal sem ter que abrir o app. Hoje só notificações pontuais.

## Critérios de aceite

- [ ] Email enviado toda segunda-feira 8h (configurável)
- [ ] Conteúdo: resumo da semana (deals criados, ganhos, perdidos, atividades, leads), comparativo vs semana anterior
- [ ] Top 3 deals em risco (sem atividade recente, alto valor)
- [ ] Top 3 leads mais quentes (score IA, urgência)
- [ ] Cada user com workspace ativo recebe (admin/gestor recebe agregado, vendedor recebe pessoal)
- [ ] Opt-out fácil (link "Desabilitar"), preferência salva
- [ ] Preview no UI antes de receber

## Plan

1. Cron task `weekly_digest` (segunda 8h timezone do workspace):
   - Para cada workspace ativo, gerar digest
   - Buscar dados da semana anterior
   - Renderizar HTML
   - Enviar via Resend para cada user

2. Função `generateWeeklyDigest(workspaceId, userId, role)`:
   - Coleta métricas: deals_created, deals_won, deals_lost, activities, calls, leads_in
   - Calcula deltas vs semana anterior
   - Identifica deals em risco (open + alto valor + sem activity 5+ dias)

3. Template HTML em `src/lib/email/templates/weekly-digest.tsx` (react-email opcional):
   - Header com branding workspace
   - Stats grid (4 cards)
   - Tabela top deals em risco
   - Tabela top leads
   - Footer com link "Configurar lembretes"

4. Migração para preferências:
   ```sql
   ALTER TABLE profiles
     ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"weekly_digest": true, "push": true, "inbox_email": false}';
   ```

5. UI `/configuracoes/notificacoes`:
   - Switch "Receber digest semanal"
   - Botão "Ver exemplo" → mostra preview do email

## Arquivos afetados

- `src/lib/email/templates/weekly-digest.tsx` (novo)
- `src/lib/digest/weekly.ts` (novo, generate)
- `src/app/api/cron/run/route.ts` (task)
- `supabase/migrations/00032_notification_prefs.sql`
- `src/app/(main)/configuracoes/notificacoes/page.tsx`

## Como testar

1. Workspace com dados de 1+ semana
2. Trigger cron `?task=weekly_digest`
3. Email recebido na segunda
4. HTML responsivo, branding correto
5. Click "Desabilitar" → preferência atualiza
6. Próxima semana: não recebe

## Notas

- Não enviar se workspace inativo (sem deals/atividades nos últimos 30d)
- Timezone do workspace influencia hora de envio
- Considerar digest diário em fase futura (opt-in)
