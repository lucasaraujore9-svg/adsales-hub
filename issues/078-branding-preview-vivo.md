# 078 — Branding com preview ao vivo

**Tipo:** feature (UX)
**Severidade:** alto
**Bloco:** Billing / Multi-tenant
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

`/configuracoes/marca` permite editar accent color + logo + favicon, mas sem preview do resultado. Usuário escolhe cor, salva, descobre que ficou ruim só ao publicar uma LP.

## Critérios de aceite

- [ ] Layout split: form à esquerda, preview à direita
- [ ] Preview mostra simultaneamente:
  - Sidebar do app com logo + accent
  - Card de relatório PDF mockup
  - Email transacional mockup
  - LP mockup (hero block)
- [ ] Mudança no form atualiza preview instantaneamente (sem reload)
- [ ] Validação: cor com contraste WCAG AA mínimo
- [ ] Logo: aceitar PNG/SVG, max 2MB, dimensões recomendadas
- [ ] Favicon: aceitar ICO/PNG 32x32 ou 256x256
- [ ] Botão "Resetar para padrão"

## Plan

1. Atualizar `/configuracoes/marca/page.tsx` para layout split

2. Criar `src/components/branding/branding-preview.tsx` (client):
   - Recebe `{ accentColor, logoUrl, faviconUrl, brandName }`
   - 4 mockups stacked (sidebar, relatório, email, LP)
   - CSS variables locais (`--preview-accent: ${color}`) aplicadas só no preview

3. Form usa estado local + onChange dispara update no preview imediatamente

4. Validação cor:
   ```ts
   import { getContrast } from 'polished';
   const contrast = getContrast(color, '#FFFFFF');
   if (contrast < 4.5) warn('Contraste baixo com texto branco');
   ```

5. Save action: atualiza `workspace_branding`

6. Aplicação real:
   - Verificar `src/lib/branding.ts` — função que injeta CSS variables no `<html>`
   - Garantir que cor accent é aplicada via `style="--accent: ...">` no body do main layout
   - Logo aparece no sidebar
   - Favicon: dynamic em `<head>` via metadata (Next.js)

## Arquivos afetados

- `src/app/(main)/configuracoes/marca/page.tsx`
- `src/components/branding/branding-preview.tsx` (novo)
- `src/components/branding/branding-form.tsx`
- `src/lib/branding.ts` (aplicação real)

## Como testar

1. Acessar `/configuracoes/marca`
2. Mudar accent para "#00FF00" → preview atualiza
3. Aviso de contraste se necessário
4. Upload logo PNG → aparece no preview imediatamente
5. Salvar → recarregar app → cor aplicada em sidebar, botões, badges
6. LP publicada do workspace usa mesma cor
7. Resetar → volta para `#FF5E1A`

## Notas

- Preview com debounce (300ms) para evitar re-render excessivo
- Storage de logo em Supabase Storage bucket `workspace-branding`
- Não permitir cor muito clara (ofusca texto)
- Em fase futura: light mode com cores diferentes
