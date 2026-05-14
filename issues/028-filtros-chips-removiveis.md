# 028 — Filtros aplicados visíveis com chips removíveis

**Tipo:** fix (UX)
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Em [src/app/(main)/contatos/page.tsx](../src/app/(main)/contatos/page.tsx) e [src/app/(main)/pipeline/page.tsx](../src/app/(main)/pipeline/page.tsx) o usuário aplica filtros por dropdown (lifecycle_stage, source, owner, etc.) mas:
- Não aparece nada visualmente indicando o que está filtrado
- Só existe um botão "Limpar filtros" genérico
- Confusão: "estou vendo todos os contatos ou só os de SaaS?"

## Critérios de aceite

- [ ] Acima da lista, mostrar chips para cada filtro ativo
- [ ] Cada chip tem label legível (ex: "Estágio: Cliente", "Fonte: Meta Ads")
- [ ] Chip tem ícone X que remove só esse filtro
- [ ] "Limpar todos" também disponível se ≥ 2 chips
- [ ] Chips animam ao adicionar/remover
- [ ] Funciona em mobile (não quebra layout)
- [ ] Estado URL atualiza ao remover (search params)

## Plan

1. Criar componente reutilizável `src/components/shared/filter-chips.tsx`:
   ```tsx
   type FilterChip = {
     key: string; // 'lifecycle_stage'
     label: string; // 'Estágio'
     value: string; // 'customer'
     valueLabel: string; // 'Cliente'
   };
   
   export function FilterChips({ chips, onRemove, onClearAll }: {
     chips: FilterChip[];
     onRemove: (key: string) => void;
     onClearAll?: () => void;
   }) {
     if (chips.length === 0) return null;
     return (
       <div className="flex flex-wrap items-center gap-2 mb-4">
         {chips.map(c => (
           <span key={`${c.key}-${c.value}`} 
             className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[color:var(--bg-2)] border border-[color:var(--line)] text-xs">
             <span className="text-[color:var(--ink-3)]">{c.label}:</span>
             <span className="font-medium">{c.valueLabel}</span>
             <button onClick={() => onRemove(c.key)} aria-label={`Remover filtro ${c.label}`}
               className="ml-1 text-[color:var(--ink-4)] hover:text-[color:var(--ink)]">
               ×
             </button>
           </span>
         ))}
         {chips.length >= 2 && onClearAll && (
           <button onClick={onClearAll} className="text-xs text-[color:var(--ink-3)] underline">
             Limpar todos
           </button>
         )}
       </div>
     );
   }
   ```

2. Em [src/app/(main)/contatos/page.tsx](../src/app/(main)/contatos/page.tsx):
   - Mapear searchParams → array de chips
   - Funções: `removeFilter(key)` atualiza URL sem o param
   - Renderizar `<FilterChips ... />` acima da tabela
   
   Como a página é server component, o handler de remoção precisa ser client. Criar wrapper `src/components/contacts/contacts-filter-chips.tsx` (client) que recebe filtros atuais e usa `useRouter` para navegar.

3. Mapeamentos de valor → label:
   - `lifecycle_stage`: lead → "Lead novo", mql → "Interesse confirmado", sql → "Qualificado", opportunity → "Oportunidade", customer → "Cliente", lost → "Perdido"
   - `source`: meta_ads → "Meta Ads", google_ads → "Google Ads", organic → "Orgânico", referral → "Indicação", manual → "Manual"
   - `owner`: lookup nome do user

4. Replicar para `/pipeline/page.tsx` com filtros próprios (status, stage, owner, value range)

## Arquivos afetados

- `src/components/shared/filter-chips.tsx` (novo)
- `src/components/contacts/contacts-filter-chips.tsx` (novo, wrapper client)
- `src/components/pipeline/pipeline-filter-chips.tsx` (novo)
- `src/app/(main)/contatos/page.tsx`
- `src/app/(main)/pipeline/page.tsx`

## Como testar

1. Abrir `/contatos`, aplicar filtro "Estágio: Cliente" e "Fonte: Meta Ads"
2. Vê 2 chips acima da tabela
3. Click X no chip "Estágio" → remove só esse filtro, lista atualiza
4. Repetir em mobile (375px) → chips quebram linha sem cortar
5. URL atualiza corretamente
6. Mesmo em pipeline

## Notas

- Manter dropdown de filtros tradicional (não substituir, complementar)
- Considerar i18n dos valueLabels em fase futura
- Em fase 2: salvar filtro como "view"
