# 041 — Mapeamento Lead Form Meta → CRM customizável

**Tipo:** feature
**Severidade:** alto
**Bloco:** B (Ads) / A (CRM)
**Dependências:** 024 (custom fields)
**Esforço estimado:** M (12-20h)
**Status:** todo

## Contexto

Em [src/app/api/webhooks/meta-leads/route.ts](../src/app/api/webhooks/meta-leads/route.ts) o mapeamento de campos do lead form pro CRM é **hardcoded**: `full_name → name, email → email, phone_number → phone`.

Se cliente tem lead form com perguntas custom ("Qual seu orçamento?", "Quantos funcionários?"), os dados são perdidos.

## Critérios de aceite

- [ ] Tabela `lead_form_field_mappings` (lead_form_id, source_field, target_type, target_field, target_custom_field_id)
- [ ] UI em `/configuracoes/meta-ads` ou `/campanhas/[id]/lead-form` para configurar mapeamentos
- [ ] Lista campos que vêm do form Meta (sincronizar com Meta API)
- [ ] Cada campo: mapeia para campo padrão do contact (name, email, phone, position, company), custom field, ou ignorar
- [ ] Webhook de leads usa esses mapeamentos
- [ ] Suporte a campos custom: cria entry em `custom_field_values`
- [ ] Default: name/email/phone mapeados automaticamente
- [ ] Validação: avisar se campo obrigatório do lead form não está mapeado

## Plan

1. Migração `supabase/migrations/00020_lead_form_mappings.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS lead_form_field_mappings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workspace_id UUID NOT NULL REFERENCES workspaces(id),
     lead_form_id UUID NOT NULL REFERENCES lead_forms(id) ON DELETE CASCADE,
     source_field TEXT NOT NULL, -- nome do field no Meta lead form
     target_type TEXT NOT NULL CHECK (target_type IN ('contact_field', 'custom_field', 'ignore', 'tag', 'metadata')),
     target_field TEXT, -- 'name', 'email', etc. (se target_type=contact_field)
     target_custom_field_id UUID REFERENCES custom_fields(id), -- se target_type=custom_field
     created_at TIMESTAMPTZ DEFAULT now()
   );
   
   CREATE UNIQUE INDEX idx_lfm_unique ON lead_form_field_mappings(lead_form_id, source_field);
   ```

2. Sync de campos do Meta lead form:
   - Em `src/lib/meta/lead-forms.ts`, função `fetchLeadFormFields(formId, accessToken)` que retorna `[{ name, label, type, required }]`
   - Salvar em `lead_forms.fields_schema` (JSONB)

3. UI em `/campanhas/[id]/lead-form` (ou `/configuracoes/meta-ads/[lead-form-id]`):
   - Lista campos do form (vindos da sync Meta)
   - Para cada um: dropdown "Mapear para": [Campo padrão ▼] | [Custom field ▼] | [Ignorar]
   - Botão "Salvar mapeamentos"
   - Aviso amarelo se campo obrigatório está em "Ignorar"

4. Atualizar [src/app/api/webhooks/meta-leads/route.ts](../src/app/api/webhooks/meta-leads/route.ts):
   ```ts
   // Após receber lead com fields:
   const { data: mappings } = await admin.from('lead_form_field_mappings')
     .select('*')
     .eq('lead_form_id', leadForm.id);
   
   const contactPatch: Record<string, unknown> = {};
   const customValues: Record<string, unknown> = {}; // {custom_field_id: value}
   const tags: string[] = [];
   
   for (const fd of lead.field_data) {
     const mapping = mappings?.find(m => m.source_field === fd.name);
     if (!mapping || mapping.target_type === 'ignore') continue;
     const value = fd.values?.[0] ?? '';
     if (mapping.target_type === 'contact_field' && mapping.target_field) {
       contactPatch[mapping.target_field] = value;
     } else if (mapping.target_type === 'custom_field' && mapping.target_custom_field_id) {
       customValues[mapping.target_custom_field_id] = value;
     } else if (mapping.target_type === 'tag') {
       tags.push(value);
     }
   }
   
   // Cria/atualiza contact com contactPatch
   // Após criar, insere custom_field_values
   ```

## Arquivos afetados

- `supabase/migrations/00020_lead_form_mappings.sql` (novo)
- `src/lib/meta/lead-forms.ts` (fetch fields)
- `src/lib/actions/lead-form-mappings.ts` (novo)
- `src/app/(main)/campanhas/[id]/lead-form/page.tsx` (UI)
- `src/app/api/webhooks/meta-leads/route.ts`

## Como testar

1. Conectar ad account com lead form de teste (Meta Lead Ads test tool)
2. Sync campos do form
3. Configurar mapeamento: campo "orçamento" → custom field "Budget mensal"
4. Submeter lead de teste no Meta
5. Webhook ingere → contato criado com `name`, `email`, `phone`, e `custom_field_values` populado
6. UI do contato mostra campo Budget

## Notas

- Field type matters: campo numérico do Meta deve mapear pra custom field tipo number
- Considerar mapeamento para `metadata` (JSONB no contact) como fallback
- Em fase futura: regra "se source=A, atribuir owner=X"
