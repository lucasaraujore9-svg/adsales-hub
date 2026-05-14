# 020 — Audit log de negócios (quem mudou o quê e quando)

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Página de detalhe do negócio em [src/app/(main)/negocios/[id]/page.tsx](../src/app/(main)/negocios/[id]/page.tsx) tem aba "Histórico" mas vazia. Vendedor não vê:
- Quem moveu o deal entre estágios
- Quem alterou valor
- Quem atribuiu responsável diferente
- Quando o deal foi criado e por quem

Sem isso é impossível auditar negociação ou rastrear erros.

## Critérios de aceite

- [ ] Tabela `deal_audit_log` com PK + timestamp imutável
- [ ] Entries automáticas em: `created`, `stage_changed`, `value_changed`, `owner_changed`, `status_changed` (won/lost/open), `lost_reason_set`, `archived`
- [ ] Cada entry tem `field`, `old_value`, `new_value`, `actor_user_id`
- [ ] Aba "Histórico" no deal renderiza linha do tempo cronológica
- [ ] Audit log também acessível via API `/api/v1/deals/[id]/history`
- [ ] Triggers de DB OU action wrapper que insere automaticamente

## Plan

**Decisão:** usar trigger de DB para garantir consistência (não depender da app sempre fazer manual).

1. Migração `supabase/migrations/00015_deal_audit_log.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS deal_audit_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
     workspace_id UUID NOT NULL REFERENCES workspaces(id),
     event_type TEXT NOT NULL,
     field TEXT,
     old_value JSONB,
     new_value JSONB,
     actor_user_id UUID REFERENCES profiles(id),
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   
   CREATE INDEX idx_deal_audit_deal_created 
     ON deal_audit_log(deal_id, created_at DESC);
   CREATE INDEX idx_deal_audit_workspace 
     ON deal_audit_log(workspace_id, created_at DESC);
   
   -- RLS
   ALTER TABLE deal_audit_log ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "deal_audit_workspace_select"
     ON deal_audit_log FOR SELECT
     USING (workspace_id IN (
       SELECT workspace_id FROM workspace_members 
       WHERE user_id = auth.uid()
     ));
   
   -- Imutabilidade
   CREATE OR REPLACE FUNCTION block_deal_audit_modification()
   RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'Audit log is immutable';
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER prevent_deal_audit_update BEFORE UPDATE ON deal_audit_log
     FOR EACH ROW EXECUTE FUNCTION block_deal_audit_modification();
   CREATE TRIGGER prevent_deal_audit_delete BEFORE DELETE ON deal_audit_log
     FOR EACH ROW EXECUTE FUNCTION block_deal_audit_modification();
   
   -- Trigger de auditoria automática em deals
   CREATE OR REPLACE FUNCTION fn_deal_audit_trigger()
   RETURNS TRIGGER AS $$
   DECLARE
     actor UUID := COALESCE(current_setting('app.current_user_id', true)::uuid, NULL);
   BEGIN
     IF TG_OP = 'INSERT' THEN
       INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, actor_user_id, new_value)
       VALUES (NEW.id, NEW.workspace_id, 'created', actor, to_jsonb(NEW));
       RETURN NEW;
     ELSIF TG_OP = 'UPDATE' THEN
       IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
         INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
         VALUES (NEW.id, NEW.workspace_id, 'stage_changed', 'stage_id', to_jsonb(OLD.stage_id), to_jsonb(NEW.stage_id), actor);
       END IF;
       IF OLD.value IS DISTINCT FROM NEW.value THEN
         INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
         VALUES (NEW.id, NEW.workspace_id, 'value_changed', 'value', to_jsonb(OLD.value), to_jsonb(NEW.value), actor);
       END IF;
       IF OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id THEN
         INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
         VALUES (NEW.id, NEW.workspace_id, 'owner_changed', 'owner_user_id', to_jsonb(OLD.owner_user_id), to_jsonb(NEW.owner_user_id), actor);
       END IF;
       IF OLD.status IS DISTINCT FROM NEW.status THEN
         INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
         VALUES (NEW.id, NEW.workspace_id, 'status_changed', 'status', to_jsonb(OLD.status), to_jsonb(NEW.status), actor);
       END IF;
       RETURN NEW;
     END IF;
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER deals_audit
     AFTER INSERT OR UPDATE ON deals
     FOR EACH ROW EXECUTE FUNCTION fn_deal_audit_trigger();
   ```

2. Atualizar [src/lib/supabase/admin.ts](../src/lib/supabase/admin.ts) (ou client server) para setar `app.current_user_id` em cada request:
   ```ts
   await sb.rpc('set_config', { setting_name: 'app.current_user_id', setting_value: userId, is_local: true });
   ```
   Ou usar wrapper que executa antes de cada UPDATE em deals.

3. Criar `src/lib/queries/deal-history.ts`:
   ```ts
   export async function getDealHistory(sb, dealId: string) {
     const { data } = await sb
       .from('deal_audit_log')
       .select('*, actor:profiles(id, name, email, avatar_url)')
       .eq('deal_id', dealId)
       .order('created_at', { ascending: false });
     return data ?? [];
   }
   ```

4. Criar `src/components/deals/deal-history-tab.tsx`:
   - Recebe `dealId`
   - Busca histórico via query
   - Renderiza timeline:
     ```
     ● 13 mai 14:32 — João Silva mudou estágio: Negociação → Proposta
     ● 12 mai 09:15 — Maria criou negócio
     ```
   - Formatadores específicos por evento (resolve UUIDs para nomes legíveis: stage, owner)

5. Substituir o placeholder na aba "Histórico" do deal em [src/app/(main)/negocios/[id]/page.tsx](../src/app/(main)/negocios/[id]/page.tsx)

6. Criar API `src/app/api/v1/deals/[id]/history/route.ts` que retorna o mesmo JSON

## Arquivos afetados

- `supabase/migrations/00015_deal_audit_log.sql` (novo)
- `src/lib/queries/deal-history.ts` (novo)
- `src/components/deals/deal-history-tab.tsx` (novo)
- `src/app/(main)/negocios/[id]/page.tsx` (renderizar tab)
- `src/app/api/v1/deals/[id]/history/route.ts` (novo)

## Como testar

1. Aplicar migração
2. Mover deal entre estágios via UI
3. Abrir aba "Histórico" → vê linha "Você mudou estágio: X → Y"
4. Mudar valor do deal → nova entrada
5. Atribuir a outro vendedor → entrada
6. `SELECT * FROM deal_audit_log WHERE deal_id='...'` confere
7. Tentar UPDATE em audit log → erro "Audit log is immutable"
8. Outro workspace não vê histórico (RLS)

## Notas

- Trigger captura UPDATE inclusive de cron jobs (sem actor_user_id) — aceitável
- Não inclui mudanças via direct DB (psql) — sem actor_user_id
- Considerar replicar pattern para `contacts`, `activities` em fase futura
- Resolver IDs para nomes pode demandar query JOIN (cache em memória helper)
