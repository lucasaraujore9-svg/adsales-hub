"use client";

import { useRouter } from "next/navigation";
import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";
import { lifecycleStageLabel, sourceLabel } from "@/lib/labels";

interface Props {
  q?: string;
  life?: string;
  src?: string;
}

/**
 * Renderiza chips removíveis para os filtros aplicados na lista de contatos.
 * Ao remover, navega para a URL sem o param.
 */
export function ContactsActiveFilters({ q, life, src }: Props) {
  const router = useRouter();

  const chips: FilterChip[] = [];
  if (q) {
    chips.push({ key: "q", label: "Busca", value: q, valueLabel: `"${q}"` });
  }
  if (life) {
    chips.push({
      key: "life",
      label: "Estágio",
      value: life,
      valueLabel: lifecycleStageLabel(life),
    });
  }
  if (src) {
    chips.push({
      key: "src",
      label: "Origem",
      value: src,
      valueLabel: sourceLabel(src),
    });
  }

  function buildUrl(removeKey?: string): string {
    const params = new URLSearchParams();
    if (q && removeKey !== "q") params.set("q", q);
    if (life && removeKey !== "life") params.set("life", life);
    if (src && removeKey !== "src") params.set("src", src);
    const qs = params.toString();
    return qs ? `/contatos?${qs}` : "/contatos";
  }

  function handleRemove(key: string) {
    router.push(buildUrl(key));
  }

  function handleClearAll() {
    router.push("/contatos");
  }

  return (
    <FilterChips
      chips={chips}
      onRemove={handleRemove}
      onClearAll={handleClearAll}
      className="mb-4"
    />
  );
}
