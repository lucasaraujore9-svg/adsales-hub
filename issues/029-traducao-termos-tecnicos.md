# 029 — Tradução de termos técnicos para leigo

**Tipo:** fix (UX)
**Severidade:** médio
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** XS (1-2h)
**Status:** todo

## Contexto

Sistema usa termos em inglês (deal, lead, prospect, MQL, SQL, churn, ROAS, CPL) sem tradução ou explicação. Dono de PME leigo não entende:
- "deal" → deveria ser "negócio"
- "lead" → "lead novo" ou "contato novo"
- "MQL" → "Interesse confirmado"
- "SQL" → "Qualificado"
- "lost" → "Perdido"
- "won" → "Ganho"

## Critérios de aceite

- [ ] Termos em UI traduzidos para pt-BR
- [ ] Função `lifecycleStageLabel(value)` em `src/lib/labels.ts`
- [ ] Função `sourceLabel(value)` para fontes
- [ ] Função `dealStatusLabel(value)` para status
- [ ] Função `activityTypeLabel(value)` para tipos de atividade
- [ ] Funções usadas em todos os componentes que renderizam esses valores
- [ ] Tooltips quando termo for obrigatoriamente técnico (CPL, ROAS) explicam o significado

## Plan

1. Criar `src/lib/labels.ts`:
   ```ts
   export function lifecycleStageLabel(value: string): string {
     const map: Record<string, string> = {
       lead: "Lead novo",
       mql: "Interesse confirmado",
       sql: "Qualificado",
       opportunity: "Oportunidade",
       customer: "Cliente",
       lost: "Perdido",
     };
     return map[value] ?? value;
   }
   
   export function sourceLabel(value: string): string {
     const map: Record<string, string> = {
       meta_ads: "Meta Ads",
       facebook_ads: "Facebook Ads",
       instagram_ads: "Instagram Ads",
       google_ads: "Google Ads",
       organic: "Orgânico",
       referral: "Indicação",
       manual: "Cadastro manual",
       form: "Formulário",
       landing_page: "Landing page",
       imported: "Importado",
       whatsapp: "WhatsApp",
       phone: "Telefone",
       email: "Email",
       chat: "Chat",
     };
     return map[value] ?? value;
   }
   
   export function dealStatusLabel(value: string): string {
     const map: Record<string, string> = {
       open: "Em andamento",
       won: "Ganho",
       lost: "Perdido",
       archived: "Arquivado",
     };
     return map[value] ?? value;
   }
   
   export function activityTypeLabel(value: string): string {
     const map: Record<string, string> = {
       call: "Ligação",
       email: "Email",
       whatsapp: "WhatsApp",
       meeting: "Reunião",
       task: "Tarefa",
       note: "Nota",
       sms: "SMS",
     };
     return map[value] ?? value;
   }
   
   export function metricTooltip(metric: string): string {
     const map: Record<string, string> = {
       cpl: "Custo por Lead — quanto custa em média trazer 1 contato",
       cpa: "Custo por Aquisição — quanto custa fechar 1 cliente",
       roas: "Retorno sobre Investimento em Ads — receita / valor gasto em ads",
       ctr: "Taxa de Clique — % de pessoas que viram o anúncio e clicaram",
       cpm: "Custo por mil impressões",
       ltv: "Lifetime Value — receita total esperada por cliente",
       cac: "Custo de Aquisição de Cliente",
       mrr: "Receita Recorrente Mensal",
       arr: "Receita Recorrente Anual",
       churn: "Taxa de cancelamento de clientes",
     };
     return map[metric.toLowerCase()] ?? metric;
   }
   ```

2. Buscar usos de strings literais para traduzir:
   ```bash
   grep -rn "'lead'\|'mql'\|'sql'\|'customer'\|'lost'\|'won'" src/components src/app --include="*.tsx"
   ```

3. Substituir nas renderizações por `lifecycleStageLabel(...)`, `dealStatusLabel(...)`, etc.

4. Para métricas técnicas (CPL, ROAS), criar componente `<MetricLabel metric="CPL" />`:
   ```tsx
   import { metricTooltip } from '@/lib/labels';
   import { Info } from 'lucide-react';
   import { Tooltip } from '@/components/ui/tooltip';
   
   export function MetricLabel({ metric }: { metric: string }) {
     return (
       <Tooltip content={metricTooltip(metric)}>
         <span className="inline-flex items-center gap-1">
           {metric.toUpperCase()} <Info size={12} className="opacity-60" />
         </span>
       </Tooltip>
     );
   }
   ```

5. Usar `<MetricLabel>` em cards de campanhas, dashboards, relatórios

## Arquivos afetados

- `src/lib/labels.ts` (novo)
- `src/components/shared/metric-label.tsx` (novo)
- ~10-20 componentes/páginas que renderizam status/source/lifecycle

## Como testar

1. Acessar `/contatos` → coluna "Estágio" mostra "Cliente" não "customer"
2. Filtros mostram nomes legíveis
3. Hover em "CPL" no dashboard → tooltip explica
4. Lista de campanhas: "ROAS" tem ícone de info

## Notas

- Não renomear chaves no banco (mantém `lifecycle_stage='customer'`), só labels visuais
- Em fase futura: i18n completo (suporte EN, ES)
- Considerar permitir empresa configurar labels custom (ex: chamar "Lead" de "Prospecção")
