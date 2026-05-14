# Issues — AdSales Hub

Cada arquivo deste diretório é uma issue numerada, com **plano embutido** pronto para execução via `/execute NNN` (manual) ou direto pelo Claude Code.

## Convenção de nomenclatura

```
NNN-titulo-curto-em-kebab-case.md
```

NNN é zero-padded (001, 002, ..., 099).

## Categorias por faixa numérica

| Faixa | Categoria |
|---|---|
| 001-019 | Compliance, segurança, UX bloqueante |
| 020-039 | CRM essencial (atividades, deals, contatos, automação, busca) |
| 040-059 | Marketing/Ads/Social (Meta API, criativos, social, email) |
| 060-074 | SDR + Voz IA + Contratos/E-signature |
| 075-089 | Billing, multi-tenant, branding, super-admin |
| 090-099 | Analytics, relatórios, mobile, notificações |

## Estrutura padrão de cada issue

```markdown
# NNN — Título

**Tipo:** infra | feature | fix | refactor | compliance
**Severidade:** crítico | alto | médio | baixo
**Bloco:** A (CRM) | B (Ads) | C (Marketing) | D (Analytics) | E (SDR/Voz) | F (Contratos) | Billing | Infra
**Dependências:** (outras issues que precisam vir antes, ou "nenhuma")
**Esforço estimado:** XS (<2h) | S (2-8h) | M (8-24h) | L (24-80h) | XL (>80h)
**Status:** todo | doing | done

## Contexto
(O problema real, sintoma observável e impacto no usuário leigo.)

## Critérios de aceite
- [ ] Critério 1 (testável)
- [ ] Critério 2
- [ ] ...

## Plan (passo a passo)
1. Passo concreto com arquivo:linha quando aplicável
2. ...

## Arquivos afetados
- `caminho/arquivo.ts` — o que muda

## Como testar
Roteiro manual de teste passo a passo.

## Notas
Observações, riscos, decisões de design.
```

## Status atual (gerado em 2026-05-13)

Veja `STATUS.md` para o quadro consolidado de andamento.
