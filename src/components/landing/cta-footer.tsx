"use client";

import Link from "next/link";
import { Arrow, Logo, Wordmark } from "./icons";
import {
  useMagnetic,
  useMouseSpotlight,
  useScrollAnimate,
  useScrollWordReveal,
} from "@/lib/animations";

export function LandingFinalCTA() {
  const cardRef = useScrollAnimate<HTMLDivElement>({
    translateY: [120, 0],
    scale: [0.85, 1],
    rotateX: [12, 0],
    opacity: [0.3, 1],
    perspective: 1800,
    range: [0, 0.6],
    startVp: 0.95,
    endVp: 0.3,
  });
  const spotlightRef = useMouseSpotlight<HTMLDivElement>();
  const titleRef = useScrollWordReveal<HTMLHeadingElement>({
    distance: 70,
    rotate: 8,
    windowSize: 0.32,
    range: [0.1, 0.95],
    startVp: 0.95,
    endVp: 0.4,
  });
  const ctaRef = useMagnetic<HTMLAnchorElement>({ strength: 24 });
  return (
    <section className="py-[72px] md:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div
          ref={cardRef}
          className="relative"
        >
        <div
          ref={spotlightRef}
          className="relative overflow-hidden rounded-[32px] bg-[color:var(--accent)] text-white"
          style={{
            padding: "clamp(56px, 8vw, 112px) clamp(24px, 6vw, 96px)",
            backgroundImage:
              "radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.18), transparent 60%), linear-gradient(135deg, var(--accent), var(--accent-2))",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 opacity-[.14]"
          >
            <svg viewBox="0 0 200 200" width="380" height="380">
              <circle cx="100" cy="42" r="7" fill="#FFFFFF" />
              <path
                d="M100 60 L156 116 L124 116 L124 158 L76 158 L76 116 L44 116 Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <div className="relative max-w-[820px]">
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold uppercase"
              style={{ letterSpacing: ".12em" }}
            >
              <span className="h-[5px] w-[5px] rounded-full bg-white" />
              Trial 14 dias · sem cartão
            </div>
            <h2
              ref={titleRef}
              className="m-0 font-semibold leading-[0.96] tracking-[-0.045em]"
              style={{ fontSize: "clamp(40px, 6vw, 84px)" }}
            >
              Menos ferramenta<span className="opacity-55">·</span>
              <br />
              mais ROAS.
            </h2>
            <p className="mt-7 max-w-[600px] text-lg leading-[1.5] text-white/85">
              Setup em 5 minutos. Sua primeira campanha publicada hoje. Suporte por WhatsApp.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                ref={ctaRef}
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full border-0 bg-white px-7 py-4 text-[15px] font-semibold text-[color:var(--ink)]"
              >
                Testar grátis 14 dias <Arrow style={{ width: 15, height: 15 }} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-white/35 bg-transparent px-6 py-4 text-[15px] font-medium text-white"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

interface FooterItem {
  label: string;
  href?: string;
}

export function LandingFooter() {
  const cols: [string, FooterItem[]][] = [
    [
      "Plataforma",
      [
        { label: "CRM de vendas", href: "/glossario/crm" },
        { label: "Tráfego pago IA", href: "/glossario/trafego-pago" },
        { label: "Social", href: "/#modulos" },
        { label: "SDR de voz IA", href: "/glossario/sdr" },
        { label: "Analytics", href: "/glossario/atribuicao" },
        { label: "Landing pages", href: "/#modulos" },
        { label: "Contratos", href: "/#modulos" },
      ],
    ],
    [
      "Recursos",
      [
        { label: "Blog", href: "/blog" },
        { label: "Comparativos", href: "/recursos" },
        { label: "Calculadoras", href: "/recursos" },
        { label: "Glossário", href: "/recursos" },
        { label: "Guias", href: "/recursos" },
      ],
    ],
    [
      "Comparativos",
      [
        { label: "vs RD Station", href: "/comparativos/rd-station" },
        { label: "vs Pipedrive", href: "/comparativos/pipedrive" },
        { label: "vs HubSpot", href: "/comparativos/hubspot" },
        { label: "vs Kommo", href: "/comparativos/kommo" },
      ],
    ],
    [
      "Empresa",
      [
        { label: "Política de Privacidade", href: "/privacy" },
        { label: "Termos de Serviço", href: "/terms" },
        { label: "Brand Book", href: "/brandbook.html" },
        { label: "Contato" },
      ],
    ],
  ];
  return (
    <footer className="border-t border-[color:var(--line)] px-0 pb-12 pt-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <Wordmark size={16} />
            </div>
            <p className="mt-3.5 max-w-[320px] text-[13px] leading-[1.55] text-[color:var(--ink-4)]">
              Anúncio, lead, conversa e contrato — num sistema só. Operação inteira sem 5
              ferramentas pra orquestrar.
            </p>
          </div>
          {cols.map(([t, items]) => (
            <div key={t}>
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
                {t}
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {items.map((i) =>
                  i.href ? (
                    <li key={i.label}>
                      <Link
                        href={i.href}
                        className="text-[13.5px] text-[color:var(--ink-2)] hover:text-[color:var(--ink)]"
                      >
                        {i.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={i.label}>
                      <span className="text-[13.5px] text-[color:var(--ink-2)]">
                        {i.label}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--line)] pt-6 text-xs text-[color:var(--ink-4)]">
          <span>© {new Date().getFullYear()} AdSales·Hub · São Paulo · Brasil</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[color:var(--ink)]">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--ink)]">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
