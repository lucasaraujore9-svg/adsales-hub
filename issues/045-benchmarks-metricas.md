# 045 — Benchmarks ao lado de métricas (CPL/ROAS é bom ou ruim?)

**Tipo:** feature (UX)
**Severidade:** alto
**Bloco:** B (Ads) / D (Analytics)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Métricas como "CPL R$ 45" ou "ROAS 2.1x" aparecem cruas. Dono de PME leigo não sabe se é bom ou ruim.

## Critérios de aceite

- [ ] Componente `<MetricBadge value="R$ 45" benchmark={45} kind="cpl" segment="saas" />`
- [ ] Compara valor com benchmark do segmento
- [ ] Cor/ícone: verde (✓ Bom), amarelo (⚠ Médio), vermelho (✗ Acima)
- [ ] Tooltip explica: "Esperado para SaaS: R$ 30-80. Você está em R$ 45 (verde)"
- [ ] Benchmarks por segmento + métrica armazenados em `src/lib/benchmarks.ts`
- [ ] Workspace pode escolher segmento na configuração (default detect by industry)

## Plan

1. Criar `src/lib/benchmarks.ts`:
   ```ts
   export type Segment = 'saas' | 'ecommerce' | 'services' | 'education' | 'health' | 'real_estate' | 'b2b' | 'generic';
   export type Metric = 'cpl' | 'cpa' | 'roas' | 'ctr' | 'cpm' | 'conversion_rate';
   
   type Range = { good: number; ok: number; bad: number; direction: 'lower' | 'higher' };
   // Para CPL/CPA/CPM: lower é melhor
   // Para ROAS/CTR/conversion_rate: higher é melhor
   
   export const benchmarks: Record<Segment, Partial<Record<Metric, Range>>> = {
     saas: {
       cpl: { good: 30, ok: 80, bad: 150, direction: 'lower' },
       cpa: { good: 200, ok: 500, bad: 1000, direction: 'lower' },
       roas: { good: 4, ok: 2, bad: 1, direction: 'higher' },
       ctr: { good: 0.025, ok: 0.015, bad: 0.008, direction: 'higher' },
     },
     ecommerce: {
       cpl: { good: 5, ok: 20, bad: 40, direction: 'lower' },
       cpa: { good: 30, ok: 80, bad: 150, direction: 'lower' },
       roas: { good: 6, ok: 3, bad: 1.5, direction: 'higher' },
       ctr: { good: 0.018, ok: 0.012, bad: 0.006, direction: 'higher' },
     },
     services: {
       cpl: { good: 25, ok: 60, bad: 120, direction: 'lower' },
       roas: { good: 5, ok: 2.5, bad: 1.2, direction: 'higher' },
     },
     // ...
     generic: {
       cpl: { good: 20, ok: 50, bad: 100, direction: 'lower' },
       roas: { good: 4, ok: 2, bad: 1, direction: 'higher' },
       ctr: { good: 0.02, ok: 0.012, bad: 0.006, direction: 'higher' },
     },
   };
   
   export type Verdict = 'good' | 'ok' | 'bad' | 'unknown';
   
   export function evaluateMetric(value: number, kind: Metric, segment: Segment = 'generic'): Verdict {
     const range = benchmarks[segment]?.[kind] ?? benchmarks.generic[kind];
     if (!range) return 'unknown';
     if (range.direction === 'lower') {
       if (value <= range.good) return 'good';
       if (value <= range.ok) return 'ok';
       return 'bad';
     } else {
       if (value >= range.good) return 'good';
       if (value >= range.ok) return 'ok';
       return 'bad';
     }
   }
   
   export function rangeText(kind: Metric, segment: Segment): string {
     const r = benchmarks[segment]?.[kind] ?? benchmarks.generic[kind];
     if (!r) return '';
     return r.direction === 'lower' 
       ? `Bom: ≤ ${r.good} · Ruim: > ${r.bad}` 
       : `Bom: ≥ ${r.good} · Ruim: < ${r.bad}`;
   }
   ```

2. Criar componente `src/components/shared/metric-badge.tsx`:
   ```tsx
   import { evaluateMetric, rangeText, type Metric, type Segment } from '@/lib/benchmarks';
   import { Tooltip } from '@/components/ui/tooltip';
   
   const colors = {
     good: 'text-[color:var(--good)] bg-[color:var(--good)]/10',
     ok: 'text-[color:var(--warn)] bg-[color:var(--warn)]/10',
     bad: 'text-[color:var(--bad)] bg-[color:var(--bad)]/10',
     unknown: 'text-[color:var(--ink-3)]',
   };
   
   const icons = { good: '✓', ok: '~', bad: '✗', unknown: '·' };
   
   export function MetricBadge({ 
     value, displayValue, kind, segment = 'generic' 
   }: { 
     value: number; displayValue: string; kind: Metric; segment?: Segment 
   }) {
     const verdict = evaluateMetric(value, kind, segment);
     const tip = `Para ${segment}: ${rangeText(kind, segment)}`;
     return (
       <Tooltip content={tip}>
         <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[verdict]}`}>
           {icons[verdict]} {displayValue}
         </span>
       </Tooltip>
     );
   }
   ```

3. Adicionar campo `industry_segment` em `workspaces` (se não existe) — set via configuração ou onboarding

4. Usar `<MetricBadge>` em:
   - Cards de campanha em `/campanhas/page.tsx`
   - Dashboard `/dashboard/page.tsx`
   - Performance `/campanhas/performance/page.tsx`

## Arquivos afetados

- `src/lib/benchmarks.ts` (novo)
- `src/components/shared/metric-badge.tsx` (novo)
- `src/app/(main)/campanhas/page.tsx`
- `src/app/(main)/campanhas/performance/page.tsx`
- `src/app/(main)/dashboard/page.tsx`

## Como testar

1. Workspace com segmento "saas"
2. Campanha com CPL = R$ 45 → badge "✓ R$ 45" verde
3. Campanha com CPL = R$ 200 → "✗ R$ 200" vermelho
4. Tooltip mostra range
5. Mudar segmento para ecommerce → CPL R$ 45 vira amarelo

## Notas

- Benchmarks são estimativas (reais variam por região/produto)
- Atualizar valores trimestralmente baseado em dados agregados
- Em fase futura: benchmarks calculados do próprio banco (média do segmento)
- Não confundir usuário: deixar claro "para sua indústria" no tooltip
