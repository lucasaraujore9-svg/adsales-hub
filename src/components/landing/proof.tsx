"use client";

import { useCallback } from "react";
import {
  useCountUp,
  useScrollAnimate,
  useScrollStagger,
  useScrollWordReveal,
} from "@/lib/animations";

const LOGOS = ["NEXUS", "ORBE", "AGROFERRO", "MERCADO DUPLO", "TECFACIL", "ESTUDIO 7"];

const QUOTES = [
  {
    who: "Renata P.",
    role: "CMO · varejo moveleiro",
    c: "Substituímos agência + gestor + social media + 4 ferramentas. O CAC caiu 41% no segundo mês. Hoje é 1 pessoa operando o que antes era 6.",
  },
  {
    who: "Marcelo A.",
    role: "Diretor · Indústria de alimentos",
    c: "A atribuição 1:1 entre campanha e receita fechada mudou como a diretoria olha pro marketing. Virou centro de lucro, não de custo.",
  },
  {
    who: "Camila S.",
    role: "Fundadora · Educação",
    c: "Em 7 dias tinha pipeline, SDR operando e WhatsApp qualificando. O mais surpreendente: a IA sugerindo criativo que performou melhor que o publicitário.",
  },
];

interface KpiSpec {
  prefix: string;
  value: number;
  suffix: string;
  label: string;
  formatter: (v: number) => string;
}

const formatPercentSigned = (v: number) => {
  const r = Math.round(v);
  return `${r < 0 ? "−" : r > 0 ? "+" : ""}${Math.abs(r)}%`;
};
const formatRoasX = (v: number) => `${(Math.round(v) / 10).toFixed(1)}x`;
const formatDays = (v: number) => `${Math.round(v)} dias`;

const KPIS: KpiSpec[] = [
  { prefix: "", value: -41, suffix: "", label: "CAC médio", formatter: formatPercentSigned },
  { prefix: "", value: 68, suffix: "", label: "pipeline gerado", formatter: formatPercentSigned },
  { prefix: "", value: 41, suffix: "", label: "ROAS aferido", formatter: formatRoasX },
  { prefix: "", value: 7, suffix: "", label: "para primeira venda", formatter: formatDays },
];

function KpiBlock({ kpi }: { kpi: KpiSpec }) {
  const fmt = useCallback((v: number) => kpi.formatter(v), [kpi]);
  const ref = useCountUp<HTMLDivElement>(kpi.value, { duration: 1500, format: fmt });
  return (
    <div className="bg-[color:var(--panel)] px-7 py-9 text-center">
      <div
        ref={ref}
        className="text-[44px] font-medium tracking-[-0.035em] text-[color:var(--accent)]"
      >
        {kpi.formatter(0)}
      </div>
      <div className="mt-1.5 text-[13px] text-[color:var(--ink-3)]">{kpi.label}</div>
    </div>
  );
}

export function LandingProof() {
  const quotesRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-quote]",
    translateY: [80, 0],
    scale: [0.92, 1],
    rotate: [-2, 0],
    opacity: [0, 1],
    windowSize: 0.55,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.3,
  });
  const logosRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-logo]",
    translateY: [30, 0],
    opacity: [0, 1],
    windowSize: 0.5,
    range: [0, 0.85],
  });
  const headingRef = useScrollWordReveal<HTMLDivElement>({
    distance: 30,
    rotate: 4,
    windowSize: 0.4,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.55,
  });
  const kpisRef = useScrollAnimate<HTMLDivElement>({
    translateY: [60, 0],
    scale: [0.94, 1],
    opacity: [0, 1],
    range: [0, 0.7],
    startVp: 0.95,
    endVp: 0.4,
  });

  return (
    <section className="py-[80px] md:py-[140px]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div ref={headingRef} className="text-center">
          <div className="text-xs font-medium uppercase tracking-[.14em] text-[color:var(--ink-4)]">
            MAIS DE 1.200 OPERAÇÕES RODANDO NO HUB
          </div>
          <div ref={logosRef} className="mt-7 flex flex-wrap justify-center gap-x-14 gap-y-4">
            {LOGOS.map((l) => (
              <div
                key={l}
                data-logo
                className="text-[15px] font-semibold tracking-[.15em] text-[color:var(--ink-4)]"
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        <div ref={quotesRef} className="mt-14 grid grid-cols-1 gap-5 md:mt-24 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <figure
              key={i}
              data-quote
              className="m-0 flex min-h-[320px] flex-col gap-6 rounded-[22px] p-8"
              style={{
                background: i === 1 ? "var(--ink)" : "var(--panel)",
                color: i === 1 ? "var(--bg)" : "var(--ink)",
                border: i === 1 ? "none" : "1px solid var(--line)",
              }}
            >
              <blockquote className="m-0 flex-1 text-[17px] font-medium leading-[1.5] tracking-[-0.015em]">
                “{q.c}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className="grid h-[38px] w-[38px] place-items-center rounded-full text-[13px] font-semibold"
                  style={{
                    background: i === 1 ? "rgba(255,255,255,.12)" : "var(--bg-2)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {q.who[0]}
                </div>
                <div>
                  <div className="text-[13.5px] font-medium">{q.who}</div>
                  <div
                    className="text-xs"
                    style={{ color: i === 1 ? "var(--ink-5)" : "var(--ink-4)" }}
                  >
                    {q.role}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div ref={kpisRef} className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-[color:var(--line)] bg-[color:var(--line)] md:grid-cols-4">
          {KPIS.map((kpi) => (
            <KpiBlock key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </div>
    </section>
  );
}
