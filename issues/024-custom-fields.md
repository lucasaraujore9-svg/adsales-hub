# 024 — Custom fields CRUD + render dinâmico

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** L (24-40h)
**Status:** todo

## Contexto

Tabelas `custom_fields` e `custom_field_values` existem no schema, mas:
- Sem CRUD UI em `/configuracoes/campos`
- Sem render dinâmico em formulários (criar/editar contato/deal)
- Sem render em listas
- Sem busca/filtro por custom field

Cliente leigo não consegue customizar o CRM para o próprio negócio.

## Critérios de aceite

- [ ] Página `/configuracoes/campos` lista campos por entidade (Contact, Deal, Company)
- [ ] Botão "Novo campo" abre modal: label, name (auto-gerado), type, required, options (se select), entity_type
- [ ] Tipos suportados: text, number, date, select (single), multiselect, checkbox, url, email, phone
- [ ] Campos aparecem automaticamente em formulários de criar/editar (deal, contact, company)
- [ ] Validação tipada por type
- [ ] Valores salvos em `custom_field_values`
- [ ] Lista de contatos/deals exibe primeiros 3 campos custom (ou configurável)
- [ ] Filtro por custom field na busca
- [ ] Reordenar campos (drag-drop ou order_index)

## Plan

1. Verificar estrutura existente de `custom_fields` no schema. Se faltar:
   - `entity_type TEXT CHECK IN ('contact','deal','company')`
   - `field_name TEXT` (programático)
   - `field_label TEXT`
   - `field_type TEXT`
   - `is_required BOOLEAN`
   - `options JSONB` (para select/multiselect)
   - `order_index INT`
   - `show_in_list BOOLEAN`

2. Criar `src/lib/actions/custom-fields.ts`:
   - `createCustomField(input)`
   - `updateCustomField(id, patch)`
   - `deleteCustomField(id)`
   - `reorderCustomFields(ids[])`

3. Criar `src/lib/queries/custom-fields.ts`:
   - `listCustomFields(workspaceId, entityType)`
   - `getCustomFieldValues(entityType, entityId)`
   - `setCustomFieldValues(entityType, entityId, values)`

4. UI:
   - `src/app/(main)/configuracoes/campos/page.tsx` (já existe parcial)
   - Listar campos agrupados por entity_type
   - Botão "+ Novo campo"
   - Modal `<CustomFieldFormModal>` com todos os campos
   - Drag-drop para reordenar

5. Componente `<DynamicCustomFields>` que renderiza form fields baseado em `custom_fields`:
   ```tsx
   <DynamicCustomFields entityType="deal" entityId={dealId} values={values} onChange={...} />
   ```
   - Renderiza Input/Select/Checkbox conforme `field_type`
   - Validação inline

6. Integrar `<DynamicCustomFields>` em:
   - `src/components/contacts/new-contact-button.tsx`
   - `src/components/contacts/contact-edit-panel.tsx`
   - `src/components/pipeline/new-deal-button.tsx`
   - `src/components/deals/deal-modal.tsx` ou edit panel

7. Atualizar listas (tabela de contatos/deals):
   - Buscar `custom_field_values` em batch (uma query)
   - Adicionar colunas dinâmicas após colunas fixas
   - Limitar a 3 colunas custom (configurável: `show_in_list=true`)

## Arquivos afetados

- `supabase/migrations/00016_custom_fields_extras.sql` (se schema precisar ajuste)
- `src/lib/actions/custom-fields.ts` (novo)
- `src/lib/queries/custom-fields.ts` (novo)
- `src/components/settings/custom-field-form-modal.tsx` (novo)
- `src/components/shared/dynamic-custom-fields.tsx` (novo)
- `src/app/(main)/configuracoes/campos/page.tsx`
- 4-6 componentes de form de criar/editar

## Como testar

1. Acessar `/configuracoes/campos`
2. Criar campo "Segmento" (select, options: SaaS, E-commerce, Serviços)
3. Criar contato → campo Segmento aparece no form
4. Selecionar "SaaS", salvar
5. Editar contato → valor preserva
6. Criar campo "Orçamento mensal" (number) para Deal
7. Listar contatos → coluna Segmento aparece
8. Filtrar por Segmento=SaaS → filtra corretamente
9. Reordenar campos → ordem persiste

## Notas

- Custom fields são uma das features mais complexas mas mais valorizadas
- Cuidado com performance: buscar valores em batch (não 1 query por entidade)
- Visibilidade por role pode vir em fase 2 (admin vê todos, vendedor só "público")
- Não permitir mudar `field_name` depois de criado (refs em valores)
- Considerar export/import de schema de custom fields (templates por nicho)
