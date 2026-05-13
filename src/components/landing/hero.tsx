"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Arrow } from "./icons";
import {
  useAnimateBars,
  useCountUp,
  useDrawPath,
  useFloat,
  useMagnetic,
  useMouseParallax,
  useMouseSpotlight,
  useMouseTilt,
  useScrollAnimate,
  useScrollStagger,
  useScrollWordReveal,
} from "@/lib/animations";

function UnifiedMock() {
  const pipeline: [string, number, number][] = [
    ["Captado", 42, 100],
    ["Qualificado", 18, 68],
    ["Proposta", 8, 38],
    ["Fechado", 5, 22],
  ];
  const events: { tag: string; c: string; t: string; tm: string }[] = [
    { tag: "ANÚNCIO", c: "var(--ink-3)", t: 'Campanha "Curso Excel" publicada · 3 criativos A/B', tm: "há 4s" },
    { tag: "LEAD", c: "var(--accent)", t: "Mariana A. · formulário · CPL R$ 14,80", tm: "há 12s" },
    { tag: "CRM", c: "var(--ink-3)", t: "Negócio criado · funil Tráfego Pago · SDR Bruno", tm: "há 14s" },
    { tag: "VOZ IA", c: "var(--accent)", t: "Clara ligou pra Mariana · qualificou em 78s · reunião marcada", tm: "há 18s" },
    { tag: "SOCIAL", c: "var(--ink-3)", t: "4 posts agendados reforçando copy vencedora", tm: "há 21s" },
    { tag: "MENSAGEM", c: "var(--ink-3)", t: "Sequência WhatsApp enviada · 47% abriu em 9min", tm: "há 48s" },
    { tag: "VENDA", c: "var(--good)", t: "Nexus Tec. · R$ 12.400 · fechado por Camila", tm: "há 3min" },
    { tag: "ANÁLISE", c: "var(--ink-3)", t: "IA pausou Anúncio B (fadiga) · realocou orçamento", tm: "há 6min" },
  ];

  const tiltRef = useMouseTilt<HTMLDivElement>({ max: 7, perspective: 1400, scale: 1.015 });
  const sparklineRef = useDrawPath<SVGPathElement>();
  const pipelineRef = useAnimateBars<HTMLDivElement>();
  const feedRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-event]",
    translateX: [-20, 0],
    opacity: [0, 1],
    windowSize: 0.5,
    range: [0.05, 0.85],
  });
  const formatBRL = useCallback(
    (v: number) => `R$ ${v.toLocaleString("pt-BR")}`,
    [],
  );
  const revenueRef = useCountUp<HTMLSpanElement>(184420, { format: formatBRL });

  return (
    <div
      ref={tiltRef}
      className="relative overflow-hidden rounded-[26px] border border-[color:var(--line)] bg-[color:var(--panel)] p-3"
      style={{ boxShadow: "0 40px 120px -30px rgba(10,10,20,.18)" }}
    >
      <div className="mb-2 flex items-center gap-2.5 px-3 py-2">
        <div className="flex gap-[5px]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F5A524]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F43F5E]" />
        </div>
        <div className="ml-2 text-xs font-medium text-[color:var(--ink-4)]">
          workspace / operação · hoje
        </div>
        <div className="ml-auto">
          <span className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg-2)] px-2.5 py-1 text-[11px] text-[color:var(--ink-3)]">
            Últimos 30 dias
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col gap-2.5">
          <div className="rounded-[18px] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-[22px]">
            <div className="text-[11px] font-medium uppercase tracking-[.1em] text-[color:var(--ink-4)]">
              RECEITA ATRIBUÍDA
            </div>
            <div className="mt-2.5 flex items-baseline gap-2 text-[38px] font-medium leading-none tracking-[-0.03em] text-[color:var(--ink)]">
              <span ref={revenueRef}>R$ 0</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  color: "var(--good)",
                  background: "rgba(10,123,63,.08)",
                }}
              >
                + 34%
              </span>
            </div>
            <svg
              viewBox="0 0 260 50"
              className="mt-3.5 h-[50px] w-full"
              preserveAspectRatio="none"
            >
              <path
                ref={sparklineRef}
                d="M0 40 L20 36 L40 38 L60 30 L80 32 L100 26 L120 28 L140 20 L160 22 L180 14 L200 16 L220 8 L240 10 L260 4"
                stroke="var(--accent)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M0 40 L20 36 L40 38 L60 30 L80 32 L100 26 L120 28 L140 20 L160 22 L180 14 L200 16 L220 8 L240 10 L260 4 L260 50 L0 50 Z"
                fill="var(--accent-soft)"
              />
            </svg>
          </div>

          <div
            ref={pipelineRef}
            className="rounded-[18px] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-[18px]"
          >
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[.1em] text-[color:var(--ink-4)]">
              PIPELINE · 4 ETAPAS
            </div>
            {pipeline.map(([l, n, w], i) => (
              <div key={l} className="mb-2 flex items-center gap-3">
                <span className="w-20 text-xs text-[color:var(--ink-3)]">{l}</span>
                <div className="h-[22px] flex-1 overflow-hidden rounded-md border border-[color:var(--line)] bg-[color:var(--panel)]">
                  <div
                    data-bar
                    data-target={String(w)}
                    className="flex h-full items-center pl-2.5"
                    style={{
                      width: `${w}%`,
                      background:
                        i === 3
                          ? "var(--ink)"
                          : "linear-gradient(90deg, var(--accent), var(--accent-2))",
                    }}
                  >
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: i === 3 ? "var(--bg)" : "#fff" }}
                    >
                      {n}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={feedRef}
          className="overflow-hidden rounded-[18px] border border-[color:var(--line)] bg-[color:var(--bg-2)]"
        >
          <div className="flex items-center gap-2 border-b border-[color:var(--line)] px-4 py-3.5">
            <span
              className="inline-block h-[7px] w-[7px] rounded-full bg-[color:var(--accent)]"
              style={{ animation: "pulseDot 1.8s infinite" }}
            />
            <span className="text-[11px] font-medium uppercase tracking-[.1em] text-[color:var(--ink-4)]">
              fluxo unificado · ao vivo
            </span>
          </div>
          <div className="p-2">
            {events.map((e, i) => (
              <div
                key={i}
                data-event
                className="grid grid-cols-[78px_1fr_auto] items-center gap-2.5 rounded-md p-2.5 text-[12.5px]"
              >
                <span
                  className="text-[10px] font-semibold tracking-[.08em]"
                  style={{ color: e.c }}
                >
                  {e.tag}
                </span>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap leading-tight text-[color:var(--ink-2)]">
                  {e.t}
                </span>
                <span className="text-[10.5px] text-[color:var(--ink-4)]">{e.tm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  // Section-wide spotlight effect (cursor-driven radial gradient)
  const sectionRef = useMouseSpotlight<HTMLElement>();

  // Parallax layers driven by mouse, different strengths for depth
  const blobRef = useMouseParallax<HTMLDivElement>({ strength: 60, scopeViewport: true });
  const blobScrollRef = useScrollAnimate<HTMLDivElement>({
    translateY: [0, 200],
    range: [0, 1],
    startVp: 1.0,
    endVp: 0,
  });

  // Headline word-by-word reveal scrubbed to scroll
  const titleRef = useScrollWordReveal<HTMLHeadingElement>({
    distance: 70,
    rotate: 8,
    windowSize: 0.32,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.45,
  });

  // Sub-paragraph word reveal, slower offset
  const subRef = useScrollWordReveal<HTMLParagraphElement>({
    distance: 24,
    rotate: 2,
    windowSize: 0.4,
    range: [0, 0.9],
    startVp: 0.95,
    endVp: 0.55,
  });

  // Badge: float idle + tiny mouse parallax
  const badgeRef = useFloat<HTMLAnchorElement>({ distance: 6, duration: 5200 });

  // CTAs: magnetic
  const ctaPrimaryRef = useMagnetic<HTMLAnchorElement>({ strength: 24 });
  const ctaGhostRef = useMagnetic<HTMLAnchorElement>({ strength: 16 });

  // CTA row: scrubbed scale-up
  const ctaRowRef = useScrollAnimate<HTMLDivElement>({
    translateY: [40, 0],
    opacity: [0, 1],
    range: [0.2, 0.85],
    startVp: 0.95,
    endVp: 0.45,
  });

  // Mock: scrubbed entrance — translates up + scales + tilts back
  const mockSceneRef = useScrollAnimate<HTMLDivElement>({
    translateY: [120, 0],
    scale: [0.88, 1],
    rotateX: [12, 0],
    opacity: [0.4, 1],
    perspective: 1600,
    range: [0, 0.6],
    startVp: 0.95,
    endVp: 0.2,
  });

  // Mock leaving: subtle fade + scale down as scroll past hero
  const mockOutRef = useScrollAnimate<HTMLDivElement>({
    scale: [1, 0.96],
    opacity: [1, 0.6],
    range: [0.6, 1],
    startVp: 0.5,
    endVp: -0.3,
  });

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative overflow-hidden pb-[80px] pt-12 md:pb-[120px] md:pt-16"
      style={
        {
          backgroundImage:
            "radial-gradient(600px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--accent) 8%, transparent), transparent 65%)",
        } as React.CSSProperties
      }
    >
      <div ref={blobScrollRef} className="pointer-events-none absolute -right-24 -top-36 h-[700px] w-[700px]">
        <div
          ref={blobRef}
          aria-hidden
          className="h-full w-full"
          style={{
            background: "radial-gradient(circle, var(--accent-soft), transparent 60%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="mb-8 flex justify-center">
          <a
            ref={badgeRef}
            href="#precos"
            className="inline-flex items-center gap-2.5 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] py-1.5 pl-1.5 pr-3.5 text-[12.5px] text-[color:var(--ink-2)]"
          >
            <span
              className="rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white"
              style={{ letterSpacing: ".08em" }}
            >
              BETA
            </span>
            Setup em 5 min · trial 14 dias sem cartão
            <Arrow style={{ width: 12, height: 12 }} className="text-[color:var(--ink-4)]" />
          </a>
        </div>

        <h1
          ref={titleRef}
          className="m-0 text-center font-semibold leading-[0.96] tracking-[-0.045em] text-[color:var(--ink)]"
          style={{ fontSize: "clamp(48px, 7.4vw, 104px)" }}
        >
          Anúncio, lead e venda
          <br />
          num <span className="text-[color:var(--accent)]">·</span> sistema só.
        </h1>

        <p
          ref={subRef}
          className="mx-auto mt-7 max-w-[720px] text-center font-normal leading-[1.5] text-[color:var(--ink-3)]"
          style={{ fontSize: "clamp(17px, 1.6vw, 20px)", letterSpacing: "-0.005em" }}
        >
          Cria a campanha, captura o lead, liga com IA de voz, manda WhatsApp, fecha contrato e
          mostra{" "}
          <strong className="font-semibold text-[color:var(--ink)]">
            ROAS aferido na receita real
          </strong>
          . Sem agência, sem gestor de tráfego, sem 7 ferramentas pra orquestrar.
        </p>

        <div ref={ctaRowRef} className="mt-9 flex flex-wrap justify-center gap-2.5">
          <Link
            ref={ctaPrimaryRef}
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-7 py-4 text-[15px] font-medium text-[color:var(--bg)]"
          >
            Testar 14 dias grátis
            <Arrow style={{ width: 15, height: 15 }} />
          </Link>
          <a
            ref={ctaGhostRef}
            href="#modulos"
            className="inline-flex items-center rounded-full border border-[color:var(--line-2)] bg-transparent px-6 py-4 text-[15px] font-medium text-[color:var(--ink)]"
          >
            Ver demo de 90s
          </a>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[12.5px] text-[color:var(--ink-4)]">
          <span>Sem cartão</span>
          <span className="text-[color:var(--ink-5)]">·</span>
          <span>Cancele quando quiser</span>
          <span className="text-[color:var(--ink-5)]">·</span>
          <span>Suporte WhatsApp</span>
        </div>

        <div ref={mockSceneRef} className="relative mt-12 md:mt-[72px]">
          <div ref={mockOutRef}>
            <UnifiedMock />
          </div>
        </div>
      </div>
    </section>
  );
}
