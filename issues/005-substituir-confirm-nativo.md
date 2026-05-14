# 005 — Substituir confirm() nativo por modal customizado

**Tipo:** refactor
**Severidade:** crítico
**Bloco:** Infra (CRM)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

20+ componentes usam `window.confirm()` para confirmar ações destrutivas — visualmente feio, em alguns navegadores mobile não aparece, mistura idiomas (botões em inglês), não respeita o design system. Exemplos:

- [src/components/deals/deal-detail-header.tsx:160](../src/components/deals/deal-detail-header.tsx)
- [src/components/contacts/contact-edit-panel.tsx:56](../src/components/contacts/contact-edit-panel.tsx)
- E vários componentes de campanhas, contratos, criativos, automações

Usuário leigo clica "OK" sem entender o que vai acontecer.

## Critérios de aceite

- [ ] Componente reutilizável `<ConfirmDialog>` baseado em Radix Dialog
- [ ] API ergonômica: hook `useConfirm()` ou função `confirm({ title, description, confirmLabel, cancelLabel, variant })`
- [ ] Variante `destructive` (botão vermelho)
- [ ] Suporta async (mostra spinner enquanto promessa pendente)
- [ ] Foco no botão **Cancelar** por padrão (não no destrutivo)
- [ ] Esc fecha = cancela
- [ ] Não fecha ao clicar fora se promessa em andamento
- [ ] Todos os `window.confirm()` substituídos
- [ ] Texto sempre em pt-BR

## Plan

1. Criar `src/components/ui/confirm-dialog.tsx`:
   - Componente Dialog controlado (`open`, `onOpenChange`)
   - Props: `title`, `description`, `confirmLabel="Confirmar"`, `cancelLabel="Cancelar"`, `variant: 'default' | 'destructive'`, `onConfirm: () => Promise<void> | void`

2. Criar `src/components/ui/confirm-provider.tsx`:
   - Context provider que renderiza um Dialog único no topo da árvore
   - Hook `useConfirm()` retorna função `confirm(options): Promise<boolean>`
   - Resolve `true` se usuário confirmar, `false` se cancelar/fechar

3. Adicionar `<ConfirmProvider>` em [src/app/layout.tsx](../src/app/layout.tsx) (root)

4. Identificar todos os `window.confirm` ou `confirm(` no código:
   ```bash
   grep -rn "confirm(" src/components/ src/app/(main)/ --include="*.tsx" --include="*.ts"
   ```

5. Para cada ocorrência, substituir:
   ```tsx
   // Antes
   if (!confirm("Excluir negócio?")) return;
   await deleteDeal(id);
   
   // Depois
   const ok = await confirm({
     title: "Excluir negócio?",
     description: "Esta ação não pode ser desfeita.",
     confirmLabel: "Excluir",
     variant: "destructive",
   });
   if (!ok) return;
   await deleteDeal(id);
   ```

6. Lista de arquivos esperada (busca via grep):
   - `src/components/deals/deal-detail-header.tsx`
   - `src/components/deals/deal-modal.tsx`
   - `src/components/contacts/contact-edit-panel.tsx`
   - `src/components/campaigns/campaign-header-actions.tsx`
   - `src/components/contratos/*.tsx`
   - `src/components/automations/*.tsx`
   - `src/components/sdr/*.tsx`
   - `src/components/settings/*.tsx`

## Arquivos afetados

- `src/components/ui/confirm-dialog.tsx` (novo)
- `src/components/ui/confirm-provider.tsx` (novo)
- `src/app/layout.tsx` (provider)
- 20+ componentes (substituições)

## Como testar

1. Após implementar provider, abrir `/negocios/[id]`
2. Clicar "Excluir" — modal aparece, não `confirm()`
3. Foco está em "Cancelar"
4. Esc cancela
5. Clicar "Excluir" — botão vermelho, mostra spinner enquanto deleta
6. Mobile: modal centralizado, não cortado
7. Repetir para campanha, contato, contrato, automação

## Notas

- Manter `dialog` semântico (role=dialog, aria-modal)
- Não mudar a lógica de negócio, apenas a UX da confirmação
- Em casos onde a ação é instantânea, manter `onConfirm` síncrono
