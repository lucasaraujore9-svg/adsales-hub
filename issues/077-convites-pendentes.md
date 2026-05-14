# 077 — Convites pendentes visíveis com reenvio/revogar

**Tipo:** feature
**Severidade:** alto
**Bloco:** Billing / Multi-tenant
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Admin convida membro mas não sabe:
- Quem foi convidado
- Quando expira
- Se aceitou ou não
- Como reenviar

Resultado: membros perdem o email, convite expira, ninguém sabe.

## Critérios de aceite

- [ ] Em `/configuracoes/usuarios`: 2 abas (ou seções): "Membros ativos" / "Convites pendentes"
- [ ] Lista de pendentes: email, role, convidado em, expira em, "convidado por"
- [ ] Botão "Reenviar" → manda email de novo, atualiza expira_em
- [ ] Botão "Revogar" → invalida convite (com confirmação)
- [ ] Botão "Copiar link" (alternativa ao email)
- [ ] Auto-clean: convites expirados há +30d são removidos pelo cron

## Plan

1. Verificar tabela `workspace_invites` no schema:
   - `id, workspace_id, email, role, invited_by_user_id, token, expires_at, accepted_at, revoked_at`

2. Query `listPendingInvites(workspaceId)`:
   - WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now()

3. Actions:
   - `resendInvite(inviteId)`: gera novo token, expires_at = now() + 7d, envia email
   - `revokeInvite(inviteId)`: set revoked_at = now()
   - `getInviteLink(inviteId)`: retorna URL `/accept-invite?token=X`

4. UI:
   - Atualizar `src/app/(main)/configuracoes/usuarios/page.tsx`:
     - 2 abas via `Tabs` (Radix)
     - "Convites pendentes (X)" com badge contador
     - Tabela com ações por linha

5. Cron task `clean_expired_invites`:
   - DELETE FROM workspace_invites WHERE expires_at < now() - interval '30 days'

## Arquivos afetados

- `src/lib/queries/workspace-members.ts`
- `src/lib/actions/workspace.ts` (resend/revoke)
- `src/app/(main)/configuracoes/usuarios/page.tsx`
- `src/components/settings/pending-invites-table.tsx` (novo)
- `src/app/api/cron/run/route.ts`

## Como testar

1. Convidar 3 emails
2. Aba "Convites pendentes" mostra 3 com data de expira
3. Reenviar 1 → toast "Email reenviado", expires_at atualizado
4. Revogar 1 → some da lista, vai pra revogados (ou some)
5. Aceitar 1 (acessar link) → some de pendentes, aparece em ativos
6. Forçar `expires_at` no passado → cron remove

## Notas

- Manter lista de revogados invisível (pode ser histórico admin)
- Considerar limite de convites pendentes simultâneos (anti-spam)
- Email de convite usa branding do workspace (issue 078)
