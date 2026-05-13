"use client";

import { useState } from "react";
import Link from "next/link";
import { Arrow, Check } from "./icons";
import {
  useScrollAnimate,
  useScrollStagger,
  useScrollWordReveal,
} from "@/lib/animations";

interface ModuleItem {
  id: string;
  name: string;
  price: number;
  required?: boolean;
  d: string;
}

const MODULE_CATALOG: ModuleItem[] = [
  { id: "crm", name: "CRM + Pipeline", price: 0, required: true, d: "Funil ilimitado, lead, atribuição 1:1" },
  { id: "ads", name: "Gestão de Tráfego IA", price: 190, d: "Meta + Google · copy, criativo e lance gerados por IA" },
  { id: "social", name: "Social Orgânico", price: 140, d: "5 redes · calendário + IA replicando criativo vencedor" },
  { id: "msg", name: "Central de Atendimento", price: 180, d: "WhatsApp, e-mail e SMS com bot de qualificação" },
  { id: "sdr", name: "SDR + Agente de Voz IA", price: 220, d: "Qualificação por voz em 90s, agenda direto na reunião" },
  { id: "bi", name: "BI + Atribuição Avançada", price: 160, d: "CAC, LTV, payback · pergunte em português à IA" },
  { id: "site", name: "Landing Pages + Forms", price: 90, d: "Páginas ilimitadas · editor drag-and-drop" },
  { id: "sign", name: "Contratos e Assinatura", price: 110, d: "Proposta, contrato e assinatura eletrônica" },
];

interface Basket {
  n: string;
  p: number;
  media: string;
  d: string;
  incl: string[];
  users: string;
  cta: string;
  featured?: boolean;
}

const BASKETS: Basket[] = [
  {
    n: "Operação",
    p: 290,
    media: "até R$ 600/mês em mídia",
    d: "Começar a operar com previsibilidade. O básico bem feito.",
    incl: ["crm", "ads", "site"],
    users: "Até 3 usuários",
    cta: "Começar grátis",
  },
  {
    n: "Crescimento",
    p: 690,
    media: "até R$ 2.000/mês em mídia",
    d: "Operação completa de aquisição + atendimento automatizado.",
    incl: ["crm", "ads", "social", "msg", "bi"],
    users: "Até 8 usuários",
    cta: "Iniciar teste",
    featured: true,
  },
  {
    n: "Escala",
    p: 1490,
    media: "até R$ 8.000/mês em mídia",
    d: "Todos os módulos + SDR IA + SLA e integrações dedicadas.",
    incl: ["crm", "ads", "social", "msg", "sdr", "bi", "site", "sign"],
    users: "Usuários ilimitados",
    cta: "Falar com vendas",
  },
];

function PlanCard({ basket }: { basket: Basket }) {
  const { n, p, media, d, incl, users, cta, featured } = basket;
  const mods = MODULE_CATALOG.filter((m) => incl.includes(m.id));
  return (
    <div
      data-plan
      className="relative flex h-full flex-col rounded-[24px] p-6 md:p-8"
      style={{
        background: featured ? "var(--ink)" : "var(--panel)",
        color: featured ? "var(--bg)" : "var(--ink)",
        border: featured ? "none" : "1px solid var(--line)",
        boxShadow: featured ? "0 30px 80px -20px rgba(0,0,0,.28)" : "none",
      }}
    >
      {featured && (
        <span
          className="absolute -top-2.5 right-6 whitespace-nowrap rounded-full bg-[color:var(--accent)] px-3 py-1 text-[10.5px] font-semibold text-white"
          style={{ letterSpacing: ".1em" }}
        >
          MAIS ESCOLHIDO
        </span>
      )}
      <div
        className="text-sm font-medium"
        style={{ color: featured ? "var(--ink-5)" : "var(--ink-4)" }}
      >
        {n}
      </div>
      <div className="mt-3.5 flex items-baseline gap-1.5">
        <span
          className="text-lg"
          style={{ color: featured ? "var(--ink-5)" : "var(--ink-4)" }}
        >
          R$
        </span>
        <span className="text-[54px] font-medium leading-none tracking-[-0.035em]">{p}</span>
        <span
          className="text-sm"
          style={{ color: featured ? "var(--ink-5)" : "var(--ink-4)" }}
        >
          /mês
        </span>
      </div>
      <div className="mt-1.5 text-[12.5px] font-medium text-[color:var(--accent)]">
        + {media}
      </div>
      <p
        className="mt-3.5 min-h-[44px] text-sm leading-[1.5]"
        style={{ color: featured ? "var(--ink-5)" : "var(--ink-3)" }}
      >
        {d}
      </p>
      <Link
        href="/signup"
        className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
        style={{ background: featured ? "var(--accent)" : "var(--ink)" }}
      >
        {cta} <Arrow style={{ width: 13, height: 13 }} />
      </Link>

      <div
        className="mt-6 text-[10.5px] font-semibold uppercase tracking-[.12em]"
        style={{ color: featured ? "var(--ink-5)" : "var(--ink-4)" }}
      >
        Módulos inclusos
      </div>
      <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
        {mods.map((m) => (
          <li
            key={m.id}
            className="flex items-start gap-2.5 text-[13.5px]"
            style={{ color: featured ? "var(--bg)" : "var(--ink-2)" }}
          >
            <Check
              style={{ width: 14, height: 14, color: "var(--accent)", marginTop: 3, flexShrink: 0 }}
            />
            <span>{m.name}</span>
          </li>
        ))}
      </ul>

      <div
        className="mt-5 flex flex-col gap-1.5 pt-4 text-[12.5px]"
        style={{
          borderTop: featured
            ? "1px solid rgba(255,255,255,.1)"
            : "1px solid var(--line)",
          color: featured ? "var(--ink-5)" : "var(--ink-3)",
        }}
      >
        {[users, "Atribuição 1:1 receita", "Suporte humano em até 4h"].map((t) => (
          <div key={t} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[color:var(--accent)]" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomBuilder() {
  const [selected, setSelected] = useState(new Set(["crm", "ads"]));
  const [media, setMedia] = useState(2000);

  const toggle = (id: string) => {
    if (id === "crm") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const base = 190;
  const modulesCost = MODULE_CATALOG.filter((m) => selected.has(m.id)).reduce(
    (s, m) => s + m.price,
    0,
  );
  const mediaFee =
    media <= 600 ? 0 : media <= 2000 ? 80 : media <= 8000 ? 220 : 480;
  const total = base + modulesCost + mediaFee;

  const fmt = (n: number) => "R$ " + n.toLocaleString("pt-BR");
  const mediaLabel =
    media <= 600
      ? "até R$ 600"
      : media <= 2000
        ? "até R$ 2.000"
        : media <= 8000
          ? "até R$ 8.000"
          : "R$ 8.000+";

  return (
    <div className="mt-20 overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel)]">
      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr]">
        <div className="border-b border-[color:var(--line)] p-10 md:border-b-0 md:border-r">
          <span className="kicker">Monte sua cesta</span>
          <h3 className="my-2 mt-4 text-[30px] font-semibold leading-tight tracking-[-0.03em]">
            Outra combinação?
            <br />
            <span className="text-[color:var(--accent)]">Monta a sua.</span>
          </h3>
          <p className="m-0 text-[14.5px] leading-[1.5] text-[color:var(--ink-3)]">
            Pague apenas pelos módulos que vai usar. Atribuição 1:1 receita e CRM incluídos em
            qualquer configuração.
          </p>

          <div className="mt-7">
            <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
              Módulos
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {MODULE_CATALOG.map((m) => {
                const on = selected.has(m.id);
                const req = m.required;
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    disabled={req}
                    className="flex flex-col gap-1 rounded-xl px-3.5 py-3.5 text-left"
                    style={{
                      background: on ? "var(--accent-soft)" : "var(--bg-2)",
                      border: on
                        ? "1px solid var(--accent)"
                        : "1px solid var(--line)",
                      cursor: req ? "default" : "pointer",
                      opacity: req ? 0.95 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium tracking-[-0.005em] text-[color:var(--ink)]">
                        {m.name}
                      </span>
                      {req ? (
                        <span className="text-[9px] font-semibold uppercase tracking-[.1em] text-[color:var(--ink-4)]">
                          INCLUSO
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: on ? "var(--accent)" : "var(--ink-4)",
                          }}
                        >
                          {on ? "−" : "+"}R${m.price}
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] leading-[1.35] text-[color:var(--ink-4)]">
                      {m.d}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
                Mídia / mês
              </span>
              <span className="text-sm font-medium">{mediaLabel}</span>
            </div>
            <input
              type="range"
              min={200}
              max={10000}
              step={100}
              value={media}
              onChange={(e) => setMedia(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "var(--accent)" }}
            />
            <div className="mt-1 flex justify-between text-[10.5px] text-[color:var(--ink-4)]">
              <span>R$ 200</span>
              <span>R$ 10k+</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-[color:var(--bg-2)] p-10">
          <span className="kicker">Sua cesta</span>
          <div className="mt-4 flex flex-col gap-2.5 border-b border-[color:var(--line)] pb-4">
            <div className="flex justify-between gap-3 text-[13px] text-[color:var(--ink-3)]">
              <span className="min-w-0 flex-1">Base da plataforma</span>
              <span className="shrink-0">{fmt(base)}</span>
            </div>
            {MODULE_CATALOG.filter((m) => selected.has(m.id) && !m.required).map((m) => (
              <div
                key={m.id}
                className="flex justify-between gap-3 text-[13px] text-[color:var(--ink-3)]"
              >
                <span className="min-w-0 flex-1">{m.name}</span>
                <span className="shrink-0">+ R$ {m.price}</span>
              </div>
            ))}
            {mediaFee > 0 && (
              <div className="flex justify-between gap-3 text-[13px] text-[color:var(--ink-3)]">
                <span className="min-w-0 flex-1">Volume de mídia ({mediaLabel})</span>
                <span className="shrink-0">+ R$ {mediaFee}</span>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
              Investimento mensal
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-lg text-[color:var(--ink-3)]">R$</span>
              <span className="text-[64px] font-medium leading-none tracking-[-0.04em] text-[color:var(--ink)]">
                {total.toLocaleString("pt-BR")}
              </span>
              <span className="text-sm text-[color:var(--ink-4)]">/mês</span>
            </div>
            <div className="mt-1.5 text-[13px] text-[color:var(--accent)]">
              + {mediaLabel} em mídia gerida
            </div>
          </div>

          <Link
            href="/signup"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] px-6 py-4 text-[15px] font-medium text-[color:var(--bg)]"
          >
            Contratar esta cesta <Arrow style={{ width: 14, height: 14 }} />
          </Link>
          <div className="mt-3 text-center text-xs text-[color:var(--ink-4)]">
            14 dias grátis · sem cartão · cancele quando quiser
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPricing() {
  const compare: [string, string, string, boolean?][] = [
    ["Agência", "R$ 9.500", "fee mensal"],
    ["Gestor tráfego", "R$ 3.200", "freelancer"],
    ["5 ferramentas", "R$ 2.140", "assinaturas"],
    ["AdSales Hub", "R$ 690", "plataforma", true],
  ];
  const cardsRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-plan]",
    translateY: [80, 0],
    scale: [0.9, 1],
    rotate: [-3, 0],
    opacity: [0, 1],
    windowSize: 0.55,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.3,
  });
  const headingRef = useScrollWordReveal<HTMLHeadingElement>({
    distance: 60,
    rotate: 6,
    windowSize: 0.32,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.5,
  });
  const subRef = useScrollAnimate<HTMLParagraphElement>({
    translateY: [30, 0],
    opacity: [0, 1],
    range: [0.1, 0.7],
  });
  const compareRef = useScrollAnimate<HTMLDivElement>({
    translateY: [50, 0],
    scale: [0.95, 1],
    opacity: [0, 1],
    range: [0, 0.7],
    startVp: 0.95,
    endVp: 0.45,
  });
  return (
    <section
      id="precos"
      className="border-t border-[color:var(--line)] bg-[color:var(--bg-2)] py-[80px] md:py-[140px]"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="mx-auto max-w-[820px] text-center">
          <div className="mb-6">
            <span className="kicker">Preços</span>
          </div>
          <h2
            ref={headingRef}
            className="m-0 font-semibold leading-[1.02] tracking-[-0.04em]"
            style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
          >
            A partir de <span className="text-[color:var(--accent)]">R$ 290</span>/mês{" "}
            <span className="text-[color:var(--accent)]">·</span>
            <br />
            você escolhe o que entra na cesta.
          </h2>
        </div>
        <p ref={subRef} className="mx-auto mt-6 max-w-[620px] text-center text-[17px] text-[color:var(--ink-3)]">
          Um preço único por operação: base + módulos + faixa de mídia. Sem fee por ferramenta,
          sem % sobre anúncio.
        </p>

        <div
          ref={cardsRef}
          className="mt-16 grid grid-cols-1 items-stretch gap-5 md:grid-cols-3"
        >
          {BASKETS.map((b) => (
            <PlanCard key={b.n} basket={b} />
          ))}
        </div>

        <CustomBuilder />

        <div ref={compareRef} className="mt-16 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--panel)] p-7">
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
            Comparação com o modelo tradicional · mês típico
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-[color:var(--line)] bg-[color:var(--line)] md:grid-cols-4">
            {compare.map(([n, v, l, highlight], i) => (
              <div
                key={i}
                className="px-5 py-5"
                style={{
                  background: highlight ? "var(--ink)" : "var(--panel)",
                  color: highlight ? "var(--bg)" : "var(--ink)",
                }}
              >
                <div
                  className="text-xs"
                  style={{ color: highlight ? "var(--ink-5)" : "var(--ink-4)" }}
                >
                  {n}
                </div>
                <div className="mt-1 text-2xl font-medium tracking-[-0.02em]">{v}</div>
                <div
                  className="mt-0.5 text-[11px]"
                  style={{ color: highlight ? "var(--accent-2)" : "var(--ink-4)" }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
