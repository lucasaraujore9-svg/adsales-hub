# 047 — Preview mobile/desktop em criativos e landing pages

**Tipo:** feature (UX)
**Severidade:** alto
**Bloco:** C (Marketing)
**Dependências:** nenhuma
**Esforço estimado:** M (8-16h)
**Status:** todo

## Contexto

Hoje preview de criativo e landing page é só desktop. Como ~60% do tráfego é mobile, dono de PME publica conteúdo que fica horrível no celular sem perceber.

## Critérios de aceite

- [ ] Em `/campanhas/criativos/gerar` e `/campanhas/criativos`: preview lado a lado em mockups (Instagram Feed, Stories, Reels, Facebook Feed, desktop)
- [ ] Em `/marketing/landing-pages` (visualização): toggle Mobile (375px) / Tablet (768px) / Desktop (1280px)
- [ ] Mockup tem chrome do device (iPhone, browser bar) para realismo
- [ ] Imagens redimensionam corretamente em cada formato
- [ ] LP renderiza dentro de iframe com viewport fixo

## Plan

### Criativos

1. Criar `src/components/creatives/creative-preview.tsx`:
   - Renderiza imagem/copy em mockup
   - Variants: `instagram_feed` (1:1), `instagram_stories` (9:16), `instagram_reels` (9:16), `facebook_feed` (4:5), `messenger` (1:1)
   - Cada variant é um SVG/CSS mockup mínimo (sem precisar imagem real do iPhone — bordas arredondadas + barra de status simulada)

2. Componente `<CreativePreviewGrid creative={...} />`:
   - Grid responsivo de 3-4 mockups
   - Click em um expande para tamanho real
   - Botões: "Ver no Instagram Feed", "Ver no Stories", etc.

3. Integrar em:
   - `/campanhas/criativos/gerar/page.tsx` — após gerar, mostrar previews
   - `/campanhas/criativos/page.tsx` — modal ao clicar em creative

### Landing Pages

4. Em `/marketing/landing-pages/[id]` ou view de preview:
   - Toolbar com 3 botões: Mobile / Tablet / Desktop
   - Iframe com `width` fixo e `srcDoc` do conteúdo
   - URL público da LP em iframe

5. Componente `<LpPreviewFrame lpUrl={...} viewport="mobile" />`:
   - `<div style={{ width: viewportWidths[viewport] }}>`
   - `<iframe src={lpUrl} style={{ width: '100%', height: '100%' }} />`
   - Mockup de chrome de browser opcional

## Arquivos afetados

- `src/components/creatives/creative-preview.tsx` (novo)
- `src/components/creatives/creative-preview-grid.tsx` (novo)
- `src/components/marketing/lp-preview-frame.tsx` (novo)
- `src/app/(main)/campanhas/criativos/gerar/page.tsx`
- `src/app/(main)/campanhas/criativos/page.tsx`
- `src/app/(main)/marketing/landing-pages/[id]/page.tsx`

## Como testar

1. Gerar criativo → vê 4 previews diferentes lado a lado
2. Texto longo overflow correto em Stories
3. Imagem 16:9 corta certo em Feed (1:1)
4. LP: toggle mobile → iframe 375px
5. Visual em mobile diferente de desktop

## Notas

- Não tentar replicar Instagram pixel-perfect; aproximação suficiente
- Em fase futura: integração com Meta Ad Preview API (mais fiel)
- Performance: lazy-load iframes
