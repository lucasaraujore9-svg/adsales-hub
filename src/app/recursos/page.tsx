import Link from "next/link";
import { ContentLayout } from "@/components/content/content-layout";

export const metadata = {
  title: "Recursos · AdSales·Hub",
  description:
    "Guias, comparativos, calculadoras e glossário sobre CRM, tráfego pago, atribuição e operação de marketing/vendas pra PMEs brasileiras.",
  alternates: { canonical: "https://adsaleshub.7iegroup.com.br/recursos" },
};

interface ResourceLink {
  href: string;
  title: string;
  desc: string;
}

const SECTIONS: { title: string; kicker: string; items: ResourceLink[] }[] = [
  {
    title: "Comparativos",
    kicker: "Vs. concorrentes",
    items: [
      { href: "/comparativos/rd-station", title: "AdSales·Hub vs RD Station", desc: "Marketing automation + CRM lado a lado." },
      { href: "/comparativos/pipedrive", title: "AdSales·Hub vs Pipedrive", desc: "Pipeline visual com tráfego pago integrado." },
      { href: "/comparativos/hubspot", title: "AdSales·Hub vs HubSpot", desc: "Operação completa em reais, sem planos enterprise." },
      { href: "/comparativos/kommo", title: "AdSales·Hub vs Kommo", desc: "WhatsApp + CRM + ads num só lugar." },
    ],
  },
  {
    title: "Calculadoras grátis",
    kicker: "Ferramentas",
    items: [
      { href: "/calculadoras/roas", title: "Calculadora de ROAS", desc: "Receita ÷ investimento. Saiba se sua campanha é lucrativa." },
      { href: "/calculadoras/cac", title: "Calculadora de CAC", desc: "Custo de aquisição por cliente, sem planilha." },
      { href: "/calculadoras/ltv-cac", title: "LTV/CAC e payback", desc: "Quantos meses pra recuperar o CAC e o LTV ideal." },
      { href: "/calculadoras/cpl-ideal", title: "CPL ideal", desc: "Quanto pagar por lead pro funil fechar no positivo." },
    ],
  },
  {
    title: "Guias",
    kicker: "Como fazer",
    items: [
      { href: "/guias/como-migrar-do-rd-station", title: "Como migrar do RD Station", desc: "Passo a passo, exportação e zero downtime." },
      { href: "/guias/como-criar-campanha-no-meta-ads", title: "Como criar campanha no Meta Ads", desc: "Do briefing ao anúncio publicado em 4 passos." },
      { href: "/guias/quanto-custa-marketing-digital-pme", title: "Quanto custa marketing digital pra PME", desc: "Faixas reais e como reduzir o overhead." },
      { href: "/guias/como-demitir-agencia-sem-perder-resultado", title: "Como demitir agência sem perder resultado", desc: "Plano de transição em 60 dias." },
    ],
  },
  {
    title: "Glossário",
    kicker: "Conceitos",
    items: [
      { href: "/glossario/crm", title: "O que é CRM", desc: "Definição, evolução e quando vale ter um." },
      { href: "/glossario/roas", title: "O que é ROAS", desc: "Como calcular e o que separa um ROAS bom de medíocre." },
      { href: "/glossario/cac", title: "O que é CAC", desc: "Custo de aquisição: o número que define se você cresce ou afunda." },
      { href: "/glossario/atribuição", title: "O que é atribuição de marketing", desc: "Modelos de atribuição e por que first-touch mente." },
      { href: "/glossario/sdr", title: "O que é SDR", desc: "Função, métricas e quando vale ter (humano ou IA)." },
      { href: "/glossario/trafego-pago", title: "O que é tráfego pago", desc: "Meta, Google, TikTok: quando faz sentido e quanto custa." },
    ],
  },
  {
    title: "Para o seu negócio",
    kicker: "Personas",
    items: [
      { href: "/para/agencias", title: "Para agências de marketing", desc: "Operar 30 clientes com 3 pessoas." },
      { href: "/para/ecommerce", title: "Para e-commerce", desc: "Catálogo, carrinho abandonado e ROAS por SKU." },
      { href: "/para/educacao", title: "Para educação e cursos", desc: "Captação, qualificação e matrícula automatizadas." },
      { href: "/para/prestadores-de-servico", title: "Para prestadores de serviço", desc: "Lead → reunião → proposta → contrato sem fricção." },
    ],
  },
];

export default function RecursosPage() {
  return (
    <ContentLayout
      kicker="Recursos"
      title="Guias, ferramentas e comparativos pra operar marketing e vendas como gente grande."
      description="Tudo que aprendemos rodando 1.200+ operações brasileiras. Conteúdo prático sem fluff — cada item ou ensina algo aplicável ou economiza dinheiro."
      crumbs={[{ label: "Recursos" }]}
    >
      {SECTIONS.map((s) => (
        <section key={s.title} className="mb-14">
          <div className="mb-4">
            <span className="kicker">{s.kicker}</span>
          </div>
          <h2 className="m-0 text-3xl font-semibold tracking-[-0.025em]">{s.title}</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {s.items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="group rounded-[16px] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 transition-all hover:border-[color:var(--accent)]/40"
              >
                <div className="text-base font-semibold tracking-[-0.015em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-ink)]">
                  {it.title}
                </div>
                <div className="mt-1 text-[13.5px] leading-[1.5] text-[color:var(--ink-3)]">
                  {it.desc}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </ContentLayout>
  );
}
