# 010 — Trial countdown global no header

**Tipo:** feature
**Severidade:** alto
**Bloco:** Billing
**Dependências:** nenhuma
**Esforço estimado:** XS (2h)
**Status:** todo

## Contexto

Em [src/app/(main)/configuracoes/page.tsx:48](../src/app/(main)/configuracoes/page.tsx) o badge "Trial 14d" é minúsculo e está enterrado dentro de uma página específica. Usuário leigo não percebe que o trial vai acabar e é cobrado de surpresa.

## Critérios de aceite

- [ ] Banner sutil no topo de todas as páginas autenticadas
- [ ] Mostra "Trial encerra em X dias" com cor de urgência (laranja se ≤ 3d, vermelho se ≤ 1d)
- [ ] Botão "Fazer upgrade" leva para `/upgrade`
- [ ] Não aparece se workspace tem subscription ativa (não-trial)
- [ ] Pode ser dismissado por sessão (não permanente — volta no próximo login)
- [ ] Esconde-se em mobile menos: vira ícone clicável que abre modal
- [ ] Calculado a partir de `subscription.trial_ends_at`

## Plan

1. Buscar onde está o layout autenticado: `src/app/(main)/layout.tsx`

2. Criar `src/components/billing/trial-banner.tsx` (server component):
   - Recebe `trialEndsAt: string | null` e `subscriptionStatus: string`
   - Se status === 'trialing' → renderiza banner
   - Calcula `daysLeft = Math.ceil((new Date(trialEndsAt) - Date.now()) / 86400000)`
   - Cor: > 7d cinza/accent leve, 3-7d amarelo, ≤ 3d laranja, ≤ 1d vermelho
   - Texto: "Seu trial encerra em **X dias**. Escolha um plano para continuar."
   - Botão "Ver planos" → `/upgrade`
   - Botão "X" para dismissar (sessionStorage `adsales:trial-banner-dismissed`)

3. Em `src/app/(main)/layout.tsx`:
   - Buscar workspace + subscription do contexto auth
   - Renderizar `<TrialBanner trialEndsAt={...} subscriptionStatus={...} />` antes do `<main>`

4. Componente client `<TrialBannerDismiss>` para gerenciar sessionStorage

## Arquivos afetados

- `src/components/billing/trial-banner.tsx` (novo)
- `src/components/billing/trial-banner-dismiss.tsx` (novo, client wrapper se necessário)
- `src/app/(main)/layout.tsx`

## Como testar

1. Workspace de teste com `trial_ends_at` para daqui a 9 dias → banner cinza/discreto
2. Mudar trial_ends_at para 2 dias → banner laranja
3. Para 12 horas → vermelho urgente
4. Click "Ver planos" → vai para `/upgrade`
5. Click X → some na sessão
6. Logout/login → volta a aparecer
7. Workspace com subscription ativa → não aparece
8. Mobile (375px): não quebra layout

## Notas

- Não usar `localStorage` (queremos lembrete recorrente)
- Pegar dados do contexto de auth já existente (não fazer query duplicada)
- Em futuro: integrar com checkout direto ("Assinar agora" gera link Stripe sem ir para /upgrade)
