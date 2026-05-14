# 002 — Marcar atividade como concluída

**Tipo:** fix
**Severidade:** crítico
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** XS (1-2h)
**Status:** todo

## Contexto

Em [src/components/activities/activities-list.tsx](../src/components/activities/activities-list.tsx) o usuário vê um círculo/checkbox para marcar atividade como concluída. Tabela `activities` tem campos `completed BOOLEAN` e `completed_at TIMESTAMPTZ`, mas **nenhum handler dispara UPDATE no banco**.

Resultado: vendedor não consegue completar atividades. Pipeline acumula tarefas pendentes infinitas. CRM vira inutilizável após 1 dia.

## Critérios de aceite

- [ ] Clicar no checkbox/círculo da atividade marca como concluída no banco
- [ ] Visual atualiza imediatamente (otimistic update)
- [ ] Toast confirma "Atividade concluída" com botão "Desfazer"
- [ ] Clicar de novo na atividade concluída desmarca (volta para pendente)
- [ ] Atividade concluída fica visualmente diferente (riscada, opacidade reduzida)
- [ ] Funciona dentro de página de deal e na página geral `/atividades`
- [ ] `completed_at` é setado/limpo corretamente

## Plan

1. Verificar se `src/lib/actions/activities.ts` existe; se não, criar com:
   ```ts
   export async function toggleActivityCompleted(id: string): Promise<ActionResult>
   ```
   - Lê estado atual (`completed`)
   - Faz UPDATE com `completed = !current`, `completed_at = current ? null : new Date().toISOString()`
   - Valida workspace_id via `requireWorkspaceContext()`
   - revalida path do deal e `/atividades`

2. Em [src/components/activities/activities-list.tsx](../src/components/activities/activities-list.tsx):
   - Importar `toggleActivityCompleted` e `useTransition`
   - Adicionar handler `onClick` no botão de concluir que chama action e mostra toast
   - Otimistic update: trocar visual antes da resposta

3. Verificar `/api/v1/activities/[id]/route.ts` — se existir endpoint PATCH, usar ele em vez de criar action server-side

4. Adicionar mesma lógica no componente que lista atividades dentro de `/negocios/[id]` (provavelmente também usa `activities-list.tsx`)

## Arquivos afetados

- `src/lib/actions/activities.ts` (novo ou expandir)
- `src/components/activities/activities-list.tsx` (handler + visual)
- `src/app/api/v1/activities/[id]/route.ts` (verificar se existe)

## Como testar

1. Login como qualquer usuário com workspace ativo
2. Abrir `/atividades`
3. Clicar no círculo de uma atividade pendente
4. Toast aparece: "Atividade concluída"
5. Visual: linha riscada/opacidade
6. Recarregar página → ainda concluída
7. Clicar de novo → desmarca, toast "Atividade reaberta"
8. Banco: `SELECT completed, completed_at FROM activities WHERE id='...'` confere
9. Repetir dentro de `/negocios/[id]` aba "Atividades"

## Notas

- Webhook `activity.completed` deveria disparar quando completa (já existe?)
- Considerar emitir `dispatchWebhook(workspace, 'activity.completed', {...})` na action
- Em futuro, usar essa ação em automações ("se atividade X concluída → mover deal")
