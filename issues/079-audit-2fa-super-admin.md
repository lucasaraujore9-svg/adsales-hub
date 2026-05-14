# 079 — Audit log + 2FA em ações de super-admin

**Tipo:** compliance / security
**Severidade:** crítico
**Bloco:** Multi-tenant / Super-admin
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Em `/super-admin/workspaces/[id]` ações como "alterar plano para master" ou "conceder créditos" não têm:
- 2FA obrigatório
- Confirmação dupla
- Audit log de quem fez o quê

Risco: erro humano transforma workspace em master por 100 anos. Sabotagem interna passa despercebida.

## Critérios de aceite

- [ ] Tabela `super_admin_audit_log` (imutável)
- [ ] Toda ação de super-admin é logada (action_type, target, before, after, actor)
- [ ] Ações destrutivas/irreversíveis exigem 2FA TOTP do staff
- [ ] Confirmação dupla com input "Digite CONFIRMAR"
- [ ] UI lista audit log com filtros por staff/data/ação

## Plan

1. Migração `supabase/migrations/00029_super_admin_audit.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS super_admin_audit_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     actor_user_id UUID NOT NULL REFERENCES profiles(id),
     action_type TEXT NOT NULL,
     target_type TEXT NOT NULL, -- 'workspace', 'user', 'subscription', 'credits'
     target_id UUID,
     before_value JSONB,
     after_value JSONB,
     reason TEXT,
     ip_address INET,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   
   ALTER TABLE super_admin_audit_log ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "audit_log_admin_only" ON super_admin_audit_log
     FOR SELECT USING (EXISTS (
       SELECT 1 FROM staff_users WHERE user_id = auth.uid() AND role IN ('admin', 'engineering')
     ));
   
   -- Imutável
   CREATE FUNCTION block_super_admin_audit() RETURNS TRIGGER AS $$
   BEGIN RAISE EXCEPTION 'Super admin audit is immutable'; END;
   $$ LANGUAGE plpgsql;
   CREATE TRIGGER prevent_audit_update BEFORE UPDATE ON super_admin_audit_log
     FOR EACH ROW EXECUTE FUNCTION block_super_admin_audit();
   CREATE TRIGGER prevent_audit_delete BEFORE DELETE ON super_admin_audit_log
     FOR EACH ROW EXECUTE FUNCTION block_super_admin_audit();
   ```

2. Setup 2FA TOTP em `profiles.totp_secret`:
   - Lib `otpauth` ou `speakeasy`
   - UI: `/configuracoes/seguranca` para configurar (QR code com Google Authenticator)
   - Setup obrigatório para staff antes de usar super-admin

3. Wrapper para ações sensíveis:
   ```ts
   export async function withSuperAdminAudit<T>(
     actionType: string,
     target: { type: string; id: string },
     fn: (ctx) => Promise<{ result: T; before: any; after: any; reason?: string }>
   ): Promise<T> {
     const session = await requireStaffSession();
     // Verifica 2FA recente (últimos 5 min)
     await requireRecent2FA(session.userId);
     
     const { result, before, after, reason } = await fn(session);
     
     await admin.from('super_admin_audit_log').insert({
       actor_user_id: session.userId,
       action_type: actionType,
       target_type: target.type,
       target_id: target.id,
       before_value: before,
       after_value: after,
       reason,
       ip_address: (await getRequestMeta()).ip,
     });
     
     return result;
   }
   ```

4. Atualizar todas as actions de super-admin para usar wrapper:
   - `setWorkspacePlan(workspaceId, plan)` → withSuperAdminAudit
   - `grantCredits(workspaceId, amount)` → idem
   - `impersonateWorkspace(workspaceId)` → idem (se issue futura)

5. Modal de confirmação dupla para ações destrutivas:
   - Pergunta motivo (texto)
   - Input "Digite CONFIRMAR" para habilitar botão
   - Solicita 2FA code se sessão > 5 min sem 2FA

6. UI `/super-admin/audit`:
   - Lista últimas 100 ações
   - Filtros: staff, data, ação, target

## Arquivos afetados

- `supabase/migrations/00029_super_admin_audit.sql` (novo)
- `src/lib/super-admin/audit.ts` (novo)
- `src/lib/auth/2fa.ts` (novo)
- `src/lib/actions/super-admin.ts` (todas as actions)
- `src/components/super-admin/audit-log-table.tsx` (novo)
- `src/app/super-admin/audit/page.tsx` (nova rota)
- `src/app/(main)/configuracoes/seguranca/page.tsx` (setup 2FA)

## Como testar

1. Staff configura 2FA (QR code em authenticator)
2. Tenta alterar plano de workspace → modal pede 2FA
3. Inserir código TOTP correto → ação executa
4. Verificar `super_admin_audit_log` tem entrada
5. Tentar UPDATE/DELETE em audit_log → erro
6. Acessar `/super-admin/audit` → vê histórico
7. Filtrar por staff X → só ações dele

## Notas

- 2FA é mandatory só para staff (não usuários comuns)
- Lib `otpauth` é leve e tem boa API
- Considerar SMS 2FA como fallback (mas TOTP é mais seguro)
- Audit log nunca deve ser modificável, nem por staff
