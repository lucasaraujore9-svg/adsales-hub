# 014 — Corrigir acentuação pt-BR consistente

**Tipo:** fix
**Severidade:** médio
**Bloco:** Infra
**Dependências:** nenhuma
**Esforço estimado:** XS (1-2h)
**Status:** todo

## Contexto

Vários textos do app aparecem sem acento por falta de UTF-8 ou typo: "Nao", "voce", "instantes", "redefinicao", "Quase la", "Ja tem conta". Em SaaS para PME brasileira isso parece amador.

Exemplos:
- [src/app/(auth)/login/page.tsx](../src/app/(auth)/login/page.tsx): "Nao tem conta?"
- [src/app/(auth)/signup/page.tsx](../src/app/(auth)/signup/page.tsx): "Quase la"
- [src/app/(auth)/forgot-password/page.tsx](../src/app/(auth)/forgot-password/page.tsx): "voce", "instantes", "redefinicao"
- [src/app/onboarding/page.tsx](../src/app/onboarding/page.tsx): "nao", "Ja tem conta"
- Vários outros em telas internas

## Critérios de aceite

- [ ] Lista de palavras corrigidas: nao, voce, ja, sera, esta (verbo), apos, atras, codigo, e (conj), historia, nivel, area, pagina, login (não), criacao, redefinicao, qualificacao, aprovacao, integracao, configuracao, automacao, segmentacao, opcao, acao, secao, situacao, mensao
- [ ] Substituições feitas em **todos os arquivos `.tsx` e `.ts`** dentro de `src/`
- [ ] Strings dentro de código (não comentários) que aparecem na UI são corrigidas
- [ ] Nomes de variáveis/funções/identificadores **NÃO mudam** (mantém ASCII)
- [ ] Comentários técnicos não precisam ser tocados
- [ ] Build e tests passam

## Plan

**Estratégia:** mapeamento manual de pares (sem-acento → com-acento) só onde está em string visível ao usuário. Não usar regex global porque "nao" aparece em variáveis tipo "naoSei" que não devem mudar.

1. Gerar lista de pares:
   ```
   "Nao "       → "Não "
   " nao "      → " não "
   "voce"       → "você"   (cuidado, só em strings)
   "ja "        → "já "
   "Ja "        → "Já "
   "sera"       → "será"
   "apos"       → "após"
   "atras"      → "atrás"
   "instantes"  → "instantes"  (já correto, ignorar)
   "redefinicao" → "redefinição"
   "criacao"    → "criação"
   "configuracao" → "configuração"
   "automacao"  → "automação"
   "qualificacao" → "qualificação"
   "aprovacao"  → "aprovação"
   "integracao" → "integração"
   "segmentacao" → "segmentação"
   "opcao"      → "opção"
   "secao"      → "seção"
   "transacao"  → "transação"
   "publicacao" → "publicação"
   "execucao"   → "execução"
   ```

2. Buscar arquivos UI com problemas:
   ```bash
   grep -rEn "(Nao|voce|Ja tem|Quase la|sera enviado|configuracao|automacao|qualificacao|integracao|transacao|publicacao|execucao|redefinicao|aprovacao)" src/app src/components --include="*.tsx" --include="*.ts"
   ```

3. Para cada match, verificar contexto (se é string visível ou identificador) e usar Edit com contexto suficiente para evitar falsos positivos.

4. Fazer correções em batch, focando primeiro em telas de auth, onboarding, configurações (mais visitadas).

5. Rodar `npm run build` e `npm run typecheck` no fim.

## Arquivos afetados

(estimativa, descobrir via grep)
- `src/app/(auth)/**`
- `src/app/onboarding/**`
- `src/app/(main)/configuracoes/**`
- `src/app/(main)/automacoes/**`
- `src/components/auth/**`
- Outros que aparecerem na busca

## Como testar

1. `grep -rEn "(Nao tem|voce )" src/app src/components --include="*.tsx"` → 0 resultados
2. Visitar `/login`, `/signup`, `/forgot-password`, `/onboarding`
3. Visualmente: nenhuma palavra sem acento
4. Build passa: `npm run build`

## Notas

- Não tocar em identificadores TypeScript (variáveis, funções, tipos)
- Não tocar em chaves de objeto (ex: `{ status: "configurado" }` se for chave de DB)
- Atenção: "voce" pode estar em URL ou query string — ignorar
- Para acentuação correta, usar caracteres Unicode diretos (não entidades HTML)
