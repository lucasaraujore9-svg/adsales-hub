"use client";

import { useState } from "react";
import { Plus } from "./icons";
import {
  useAccordion,
  useScrollStagger,
  useScrollWordReveal,
} from "@/lib/animations";

const QS = [
  {
    q: "Precisa demitir agência/gestor de tráfego pra usar?",
    a: "Não. A maioria dos clientes começa mantendo a agência e usa o Hub como centro operacional. Em 2-3 meses, quando a equipe interna ganha autonomia, a decisão de substituir fica óbvia — e sua, não nossa.",
  },
  {
    q: "Como funciona a atribuição entre campanha e receita fechada?",
    a: "Cada lead carrega um ID único desde o clique no anúncio. Esse ID persiste pelo funil, pela conversa no WhatsApp, até o Ganho no CRM. O painel mostra ROAS aferido na receita real — não em conversão de plataforma.",
  },
  {
    q: "Meus dados ficam onde?",
    a: "Infraestrutura própria em servidor europeu (Frankfurt), em conformidade com LGPD e GDPR. Você tem export completo em CSV e API a qualquer momento. Se sair, sai com tudo.",
  },
  {
    q: "A IA substitui pessoas?",
    a: "Substitui trabalho repetitivo (publicar, relatar, distribuir, responder 1ª mensagem). Não substitui julgamento humano: quem vende, negocia e fecha continua sendo o seu time — com 3× mais contexto na tela.",
  },
  {
    q: "Dá pra migrar do meu CRM atual?",
    a: "Sim. Importamos de RD, Pipedrive, HubSpot, Bitrix e planilhas. O plano Escala inclui migração assistida com especialista dedicado.",
  },
  {
    q: "Tem período de fidelidade?",
    a: "Mensal. Cancele quando quiser. Se não fizer sentido, a gente prefere que você saia do que fique infeliz pagando.",
  },
];

interface FAQItemProps {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}

function FAQItem({ q, a, open, onToggle }: FAQItemProps) {
  const accordionRef = useAccordion<HTMLDivElement>(open);

  return (
    <div data-animate="faq-row" ref={accordionRef} className="border-b border-[color:var(--line)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-5 border-0 bg-transparent py-7 text-left"
      >
        <span className="text-[19px] font-medium tracking-[-0.015em] text-[color:var(--ink)]">
          {q}
        </span>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[color:var(--line-2)] transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          <Plus
            style={{ width: 14, height: 14 }}
            className="text-[color:var(--ink-3)]"
          />
        </span>
      </button>
      <div data-collapsible style={{ height: 0, opacity: 0, overflow: "hidden" }}>
        <div className="max-w-[720px] pb-7 text-base leading-[1.6] text-[color:var(--ink-3)]">
          {a}
        </div>
      </div>
    </div>
  );
}

export function LandingFAQ() {
  const [open, setOpen] = useState<number>(0);
  const headingRef = useScrollWordReveal<HTMLHeadingElement>({
    distance: 50,
    rotate: 5,
    windowSize: 0.35,
    range: [0, 0.85],
    startVp: 0.95,
    endVp: 0.5,
  });
  const listRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-animate='faq-row']",
    translateX: [-50, 0],
    opacity: [0, 1],
    windowSize: 0.55,
    range: [0, 0.95],
    startVp: 0.95,
    endVp: 0.2,
  });

  return (
    <section id="faq" className="py-[80px] md:py-[140px]">
      <div className="mx-auto max-w-[880px] px-6 md:px-8">
        <div className="text-center">
          <div className="mb-6">
            <span className="kicker">Perguntas</span>
          </div>
          <h2
            ref={headingRef}
            className="m-0 font-semibold leading-[1.02] tracking-[-0.04em]"
            style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
          >
            O que todo dono <span className="text-[color:var(--accent)]">·</span>
            <br />
            de operação pergunta.
          </h2>
        </div>
        <div ref={listRef} className="mt-16 border-t border-[color:var(--line)]">
          {QS.map((it, i) => (
            <FAQItem
              key={i}
              q={it.q}
              a={it.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
