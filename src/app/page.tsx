import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LandingProblem } from "@/components/landing/problem";
import { LandingModules } from "@/components/landing/modules";
import { LandingFlows } from "@/components/landing/flows";
import { LandingProof } from "@/components/landing/proof";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFAQ } from "@/components/landing/faq";
import { LandingFinalCTA, LandingFooter } from "@/components/landing/cta-footer";
import { LandingStructuredData } from "@/components/landing/structured-data";

const SITE_URL = "https://adsaleshub.7iegroup.com.br";

export const metadata = {
  title: "AdSales·Hub — Anúncio, lead e venda num sistema só",
  description:
    "Plataforma SaaS brasileira que unifica marketing pago, CRM, atendimento, SDR de voz IA e contratos eletrônicos. ROAS aferido na receita real. 14 dias grátis sem cartão. A partir de R$ 290/mês.",
  alternates: {
    canonical: SITE_URL,
    languages: { "pt-BR": SITE_URL },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AdSales·Hub",
    title: "AdSales·Hub — Anúncio, lead e venda num sistema só",
    description:
      "Substitui agência + gestor de tráfego + 5 ferramentas. Cria campanhas, captura leads, liga com IA de voz, fecha contrato e mostra ROAS aferido na receita real. 14 dias grátis.",
    locale: "pt_BR",
  },
};

export default function HomePage() {
  return (
    <>
      <LandingStructuredData />
      <div data-theme="light" className="bg-[color:var(--bg)] text-[color:var(--ink)]">
        <LandingNav />
        <main>
          <LandingHero />
          <LandingProblem />
          <LandingModules />
          <LandingFlows />
          <LandingProof />
          <LandingPricing />
          <LandingFAQ />
          <LandingFinalCTA />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
