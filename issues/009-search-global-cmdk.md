# 009 — Search global Cmd+K busca dados (não só navegação)

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

[src/components/layout/global-search.tsx](../src/components/layout/global-search.tsx) abre modal ao Cmd+K, mas só lista itens de navegação (Dashboard, Pipeline, etc.). API real `GET /api/v1/search?q=...` existe e busca contatos/deals/empresas, mas o frontend nunca a chama.

Resultado: usuário pressiona Cmd+K esperando achar "João Silva" e só vê itens de menu.

## Critérios de aceite

- [ ] Digitar 2+ caracteres dispara busca debounced (300ms) à API
- [ ] Resultados agrupados: Negócios, Contatos, Empresas, Atividades
- [ ] Cada item mostra nome + contexto (ex: "João Silva — Cliente, Pipeline X")
- [ ] Click navega ao detalhe do item (`/negocios/[id]`, `/contatos`, etc.)
- [ ] Mantém grupo "Navegação" como segundo nível
- [ ] Loading state visível durante fetch
- [ ] Erro tratado (mostra "Não foi possível buscar")
- [ ] Atalhos de teclado funcionam (↑↓ Enter Esc)
- [ ] Histórico recente (últimas 5 buscas) salvo em localStorage

## Plan

1. Verificar API `src/app/api/v1/search/route.ts`:
   - Confirmar que aceita `?q=` e retorna `{ contacts, deals, companies, activities }`
   - Se não existir, criar com queries simples ILIKE em cada tabela

2. Atualizar [src/components/layout/global-search.tsx](../src/components/layout/global-search.tsx):
   - Adicionar `useState` para `query`, `results`, `loading`
   - `useEffect` com debounce ao mudar query (>= 2 chars)
   - Usar `fetch('/api/v1/search?q=...')` 
   - Renderizar `<CommandGroup heading="Negócios">` etc. baseado em resultados

3. Persistir últimas buscas:
   - `localStorage` key `adsales:search:recent`
   - Array de strings, max 5
   - Se query vazia, mostrar "Recentes"

4. Adicionar ícones por tipo (Briefcase=deal, User=contato, Building=empresa, Calendar=atividade)

## Arquivos afetados

- `src/components/layout/global-search.tsx`
- `src/app/api/v1/search/route.ts` (verificar/criar)

## Como testar

1. Pressionar Cmd+K (Mac) ou Ctrl+K (Win)
2. Digitar "Joa" → após 300ms aparece grupo "Contatos" com "João Silva"
3. Click → navega para `/contatos?id=...` ou modal de detalhe
4. Reabrir search → "João Silva" aparece em "Recentes"
5. Sem resultados → "Nada encontrado"
6. Sem rede → "Erro ao buscar"
7. Setas ↑↓ navegam itens, Enter abre

## Notas

- Cuidado com queries longas — limitar a 5 resultados por categoria
- Considerar `cmdk` library (já instalado pelo `command.tsx`)
- Em fase futura: full-text search com `to_tsvector` no Postgres
