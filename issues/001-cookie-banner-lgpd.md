# 001 — Cookie banner LGPD

**Tipo:** compliance
**Severidade:** crítico
**Bloco:** Infra
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

A Política de Privacidade em [src/app/privacy/page.tsx](../src/app/privacy/page.tsx) declara que o sistema usa "cookies essenciais e analytics", mas não há banner de consentimento exibido ao visitante. A LGPD (Art. 8º) e a Resolução CD/ANPD nº 2/2022 exigem opt-in **explícito** para cookies não-essenciais antes que sejam ativados.

Sem isso:
- Risco de autuação pela ANPD
- Lead pode reclamar que dados foram coletados sem consentimento
- Política diz uma coisa; sistema faz outra

## Critérios de aceite

- [ ] Banner aparece na **primeira visita** (qualquer página pública)
- [ ] Botões: "Aceitar todos" / "Apenas essenciais" / "Configurar"
- [ ] Modal de configuração permite ligar/desligar categorias: essenciais (sempre on), analytics, marketing
- [ ] Escolha persistida em `localStorage` por 6 meses
- [ ] Não aparece novamente após escolha
- [ ] Tem link visível para a Política de Privacidade
- [ ] Acessível: foco no primeiro botão ao abrir, fechar via Esc
- [ ] Funciona em mobile (não cobre conteúdo crítico)
- [ ] Função utilitária `hasCookieConsent('analytics')` exportada para outros componentes consultarem

## Plan

1. Criar `src/lib/cookie-consent.ts` com:
   - `type ConsentCategory = 'essential' | 'analytics' | 'marketing'`
   - `type ConsentState = Record<ConsentCategory, boolean>`
   - Funções `getConsent()`, `setConsent()`, `hasConsent(cat)`, `clearConsent()`
   - Storage key: `adsales:cookie-consent` com `{ version: 1, choices: {...}, timestamp: number }`
   - TTL de 6 meses (180 dias)

2. Criar `src/components/legal/cookie-banner.tsx` (client component):
   - Hook `useCookieConsent()` que lê localStorage
   - Se não houver escolha → renderiza banner fixed bottom
   - Banner: texto curto + 3 botões + link "Configurar"
   - Modal de configurações com 3 toggles + descrição de cada categoria + botão Salvar

3. Criar `src/components/legal/cookie-settings-modal.tsx`:
   - Usa `Dialog` de `@radix-ui/react-dialog` (já instalado)
   - Form com 3 switches (Switch já no componente system)

4. Adicionar `<CookieBanner />` em [src/app/layout.tsx](../src/app/layout.tsx) dentro do body, após `{children}`

5. Adicionar link "Cookies" no footer de [src/components/landing/footer.tsx](../src/components/landing/footer.tsx) (ou similar) que abre o modal de configurações

6. Atualizar [src/app/privacy/page.tsx](../src/app/privacy/page.tsx) seção 9 para mencionar que o banner permite gerenciar consentimento

## Arquivos afetados

- `src/lib/cookie-consent.ts` (novo)
- `src/components/legal/cookie-banner.tsx` (novo)
- `src/components/legal/cookie-settings-modal.tsx` (novo)
- `src/app/layout.tsx` (adiciona componente)
- `src/components/landing/footer.tsx` ou layout público (link Cookies)
- `src/app/privacy/page.tsx` (atualiza menção)

## Como testar

1. Limpar localStorage do navegador
2. Abrir `/` em aba anônima
3. Banner deve aparecer na parte inferior da tela
4. Clicar "Configurar" → modal abre com 3 toggles
5. Desligar "Marketing", clicar "Salvar"
6. Recarregar → banner não aparece mais
7. Abrir DevTools → localStorage tem `adsales:cookie-consent` com `marketing: false`
8. Acessar footer → link "Cookies" reabre modal
9. Mobile (375px): banner não cobre logo nem conteúdo essencial
10. Tab/Esc funcionam

## Notas

- Não bloquear renderização do conteúdo enquanto banner está visível
- Não tocar nos cookies de sessão do Supabase (essenciais, sempre on)
- Quando integrar Google Analytics ou pixel Meta no site, consultar `hasConsent('analytics')` e `hasConsent('marketing')` antes de carregar scripts
- Considerar i18n no futuro (por ora, pt-BR apenas)
