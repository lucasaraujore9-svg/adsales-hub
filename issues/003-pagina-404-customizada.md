# 003 — Página 404 customizada

**Tipo:** feature
**Severidade:** alto
**Bloco:** Infra
**Dependências:** nenhuma
**Esforço estimado:** XS (1h)
**Status:** todo

## Contexto

Não existe `src/app/not-found.tsx`. Quando usuário digita URL inválida ou clica em link quebrado, vê o 404 padrão do Next.js: "This page could not be found." em **inglês**, sem branding, sem ajuda.

Para SaaS brasileiro com público leigo, isso é amador.

## Critérios de aceite

- [ ] Página customizada em pt-BR
- [ ] Branding visual (logo, cor accent, tipografia do design system)
- [ ] Mensagem amigável + sugestão de ação
- [ ] Botão "Voltar para o início" e link para "/recursos"
- [ ] Search bar opcional (busca em recursos públicos)
- [ ] Status code 404 correto retornado pelo servidor
- [ ] Funciona dentro do `(main)` (autenticado) e fora (público)

## Plan

1. Criar `src/app/not-found.tsx` (root not-found):
   - Server component
   - Layout simples: logo no topo, hero centralizado
   - "404 — Página não encontrada"
   - Subtítulo: "O endereço que você buscou não existe ou foi movido."
   - 2 botões: `<Link href="/">Início</Link>` e `<Link href="/recursos">Ver recursos</Link>`
   - Usar tokens CSS do design system (`var(--bg)`, `var(--ink)`, etc.)

2. Criar `src/app/(main)/not-found.tsx` (dentro do app autenticado):
   - Mesma estrutura, mas com sidebar/header do app
   - Botões: "Voltar ao Dashboard" e "Abrir busca"

3. Adicionar metadata: `title: "Página não encontrada"`, `robots: { index: false }`

## Arquivos afetados

- `src/app/not-found.tsx` (novo)
- `src/app/(main)/not-found.tsx` (novo)

## Como testar

1. Acessar `/foo-bar-inexistente` (deslogado) → vê 404 público com branding
2. Login, acessar `/dashboard/foo-inexistente` → vê 404 com sidebar
3. DevTools → Network: status code 404
4. Botões funcionam, levam para destino
5. Mobile: layout responsivo
6. Lighthouse: passa acessibilidade básica

## Notas

- Considerar adicionar imagem ilustrativa simples (SVG inline)
- Em futuro: integrar busca da issue 009 (search global)
