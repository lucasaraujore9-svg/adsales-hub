"use client";

import Link from "next/link";
import { Arrow } from "./icons";
import {
  useFloat,
  useMagnetic,
  useMouseParallax,
  useScrollAnimate,
  useScrollStagger,
  useScrollWordReveal,
} from "@/lib/animations";

const TOOLS = [
  { n: "Agência", c: "#FF5A1F" },
  { n: "Gestor Ads", c: "#1877F2" },
  { n: "Social Media", c: "#E1306C" },
  { n: "Designer", c: "#9333EA" },
  { n: "CRM", c: "#18C1AC" },
  { n: "E-mail tool", c: "#F59E0B" },
  { n: "WhatsApp BIZ", c: "#25D366" },
  { n: "Planilha", c: "#0F9D58" },
];

const STATS: [string, string][] = [
  ["R$ 8.400", "fim do mês em fees, assinaturas e freelas"],
  ["5 logins", "pra montar um único relatório"],
  ["72 horas", "entre o lead chegar e alguém ligar"],
  ["0%", "de rastro do anúncio até a venda fechada"],
];

// SVG viewBox geometry — center is at (200, 250). Pills are positioned
// using the SAME geometry so the line endpoints touch the pill centers.
const VB_W = 400;
const VB_H = 500;
const CENTER_X = VB_W / 2;
const CENTER_Y = VB_H / 2;
// Orbit radii — narrower on mobile via container size, but the geometry stays
// in viewBox units which scale with the container.
const RADIUS_X = 165;
const RADIUS_Y = 195;

function pillPosition(index: number, total: number): { x: number; y: number } {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER_X + Math.cos(angle) * RADIUS_X,
    y: CENTER_Y + Math.sin(angle) * RADIUS_Y,
  };
}

interface OrbitPillProps {
  tool: { n: string; c: string };
  xPct: number;
  yPct: number;
  floatDelay: number;
  floatDistance: number;
}

function OrbitPill({ tool, xPct, yPct, floatDelay, floatDistance }: OrbitPillProps) {
  const ref = useFloat<HTMLDivElement>({
    distance: floatDistance,
    duration: 4200 + floatDelay * 380,
    delay: floatDelay * 220,
  });
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        ref={ref}
        className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] px-3 py-1.5 text-[11px] font-medium md:px-3.5 md:py-2 md:text-xs"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,.04)" }}
      >
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: tool.c }} />
        {tool.n}
      </div>
    </div>
  );
}

export function LandingProblem() {
  const headingRef = useScrollWordReveal<HTMLHeadingElement>({
    distance: 60,
    rotate: 6,
    windowSize: 0.35,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.45,
  });

  const leadRef = useScrollWordReveal<HTMLParagraphElement>({
    distance: 22,
    rotate: 2,
    windowSize: 0.4,
    range: [0.05, 0.9],
    startVp: 0.95,
    endVp: 0.55,
  });

  const statsRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-stat]",
    translateY: [50, 0],
    scale: [0.85, 1],
    opacity: [0, 1],
    windowSize: 0.55,
    range: [0.1, 0.95],
  });

  // Container scrubbed entrance
  const orbitContainerRef = useScrollAnimate<HTMLDivElement>({
    scale: [0.85, 1],
    rotate: [-4, 0],
    opacity: [0, 1],
    range: [0, 0.7],
    startVp: 0.95,
    endVp: 0.4,
  });

  // SVG + center circle move together with the cursor (so lines stay attached
  // to the circle as it shifts). Pills float idle but DON'T parallax,
  // preserving the visual link between line endpoint and pill.
  const corePivotRef = useMouseParallax<HTMLDivElement>({
    strength: 22,
    scopeViewport: true,
  });

  const ctaRef = useScrollAnimate<HTMLDivElement>({
    translateY: [80, 0],
    scale: [0.92, 1],
    opacity: [0, 1],
    range: [0, 0.7],
    startVp: 0.95,
    endVp: 0.5,
  });
  const ctaButtonRef = useMagnetic<HTMLAnchorElement>({ strength: 18 });

  return (
    <section className="border-y border-[color:var(--line)] bg-[color:var(--bg-2)] py-[80px] md:py-[140px]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <div>
            <div className="kicker mb-6">O problema</div>
            <h2
              ref={headingRef}
              className="m-0 font-semibold leading-[1.0] tracking-[-0.04em]"
              style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
            >
              5 empresas <span className="text-[color:var(--accent)]">·</span>
              <br />5 logins <span className="text-[color:var(--accent)]">·</span>
              <br />0 ROAS aferido.
            </h2>
            <p
              ref={leadRef}
              className="mt-6 max-w-[520px] text-base leading-[1.55] text-[color:var(--ink-3)] md:text-lg"
            >
              Agência pra campanha. Gestor de tráfego pro anúncio. Social media pro post. Designer
              pra arte. Um CRM que ninguém usa. Fim do mês: não sobra dinheiro, não sobra tempo,
              e ninguém sabe qual anúncio virou venda.
            </p>
            <div ref={statsRef} className="mt-9 grid grid-cols-2 gap-3.5">
              {STATS.map(([n, d], i) => (
                <div
                  key={i}
                  data-stat
                  className="border-l-2 border-[color:var(--line-2)] pl-3.5"
                >
                  <div className="text-[20px] font-medium tracking-[-0.02em] md:text-[22px]">
                    {n}
                  </div>
                  <div className="mt-1 text-[12.5px] leading-tight text-[color:var(--ink-3)] md:text-[13px]">
                    {d}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={orbitContainerRef}
            className="relative mx-auto h-[380px] w-full max-w-[520px] md:h-[500px]"
          >
            {/* Pills — float idle, don't follow mouse so visual link stays clean */}
            {TOOLS.map((t, i) => {
              const pos = pillPosition(i, TOOLS.length);
              const xPct = (pos.x / VB_W) * 100;
              const yPct = (pos.y / VB_H) * 100;
              return (
                <OrbitPill
                  key={t.n}
                  tool={t}
                  xPct={xPct}
                  yPct={yPct}
                  floatDelay={i}
                  floatDistance={4 + (i % 3) * 2}
                />
              );
            })}

            {/* Lines + center: ONE pivot that follows the cursor.
                Lines remain visually attached to the center because they
                share the same parent transform. */}
            <div
              ref={corePivotRef}
              className="pointer-events-none absolute inset-0"
              aria-hidden
            >
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {TOOLS.map((_, i) => {
                  const pos = pillPosition(i, TOOLS.length);
                  // Quadratic curve from center toward each pill — control
                  // point offset perpendicular to the radius for a gentle arc.
                  const dx = pos.x - CENTER_X;
                  const dy = pos.y - CENTER_Y;
                  const len = Math.hypot(dx, dy);
                  const px = -dy / len; // perpendicular unit vector
                  const py = dx / len;
                  const arc = (i % 2 === 0 ? 1 : -1) * 22;
                  const c1x = CENTER_X + dx * 0.45 + px * arc;
                  const c1y = CENTER_Y + dy * 0.45 + py * arc;
                  // Stop the line short of the pill so it visually "enters"
                  // the pill rather than crossing it.
                  const tx = CENTER_X + dx * 0.86;
                  const ty = CENTER_Y + dy * 0.86;
                  return (
                    <path
                      key={i}
                      d={`M ${CENTER_X} ${CENTER_Y} Q ${c1x} ${c1y} ${tx} ${ty}`}
                      stroke="var(--line-2)"
                      strokeWidth="1.2"
                      fill="none"
                      strokeDasharray="3 4"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              <div
                className="pointer-events-auto absolute z-[5] grid h-[110px] w-[110px] place-items-center rounded-full border border-[color:var(--line-2)] bg-[color:var(--panel)] md:h-[130px] md:w-[130px]"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 20px 60px -20px rgba(0,0,0,.18)",
                }}
              >
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-[.12em] text-[color:var(--ink-4)] md:text-[11px]">
                    você
                  </div>
                  <div className="mt-1 text-[19px] font-semibold tracking-[-0.025em] md:text-[22px]">
                    afogado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={ctaRef}
          className="mt-16 flex flex-col items-start gap-5 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--panel)] px-6 py-6 md:mt-20 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:px-10 md:py-8"
        >
          <div className="max-w-[720px] text-lg font-medium tracking-[-0.015em] md:text-xl">
            A culpa não é sua. Essas{" "}
            <span className="text-[color:var(--accent)]">cinco empresas</span> existiam porque
            ninguém tinha juntado tudo num sistema só. Agora tem.
          </div>
          <Link
            ref={ctaButtonRef}
            href="#módulos"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-3 text-sm font-medium text-[color:var(--bg)]"
          >
            Conhecer a plataforma <Arrow style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>
    </section>
  );
}
