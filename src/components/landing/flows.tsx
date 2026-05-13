"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Plus } from "./icons";
import {
  useScrollAnimate,
  useScrollStagger,
  useScrollWordReveal,
} from "@/lib/animations";

interface Step {
  t: string;
  who: string;
  l: string;
}

interface Flow {
  id: string;
  tag: string;
  title: string;
  time: string;
  steps: Step[];
}

const FLOWS: Flow[] = [
  {
    id: "ads2sale",
    tag: "Do anúncio à venda",
    title:
      "Você digita o que quer vender. A IA cria o anúncio, roda, pega o lead e avisa o vendedor.",
    time: "4 min de setup · lead chega em < 5s",
    steps: [
      { t: "00:00", who: "Você", l: 'Escreve em 1 parágrafo: "quero vender curso de Excel pra contador, R$ 20/dia".' },
      { t: "00:04", who: "IA", l: "Gera público, 3 variações de anúncio com imagem, formulário e publica no Instagram." },
      { t: "02:17", who: "Meta", l: "Lead preenche o formulário. Webhook entrega na plataforma em 3 segundos." },
      { t: "02:17", who: "CRM", l: "Cria o negócio no funil “Tráfego Pago” com campanha, custo e anúncio vinculados." },
      { t: "02:18", who: "Vendedor", l: "Recebe push + WhatsApp: “Mariana acabou de virar lead — R$ 12 de custo”." },
    ],
  },
  {
    id: "voiceai",
    tag: "Funcionário de IA ligando",
    title:
      "Lead caiu, ninguém disponível? A IA liga pelo telefone, qualifica em 90s e marca reunião.",
    time: "Conversa em voz natural · 3 tentativas",
    steps: [
      { t: "14:02", who: "Sistema", l: "Lead entra no pipeline — score 78, classificado como quente." },
      { t: "14:03", who: "IA Voz", l: "“Olá, sou a Clara da AdSales. Você baixou nosso material, tem 2 minutos?”" },
      { t: "14:04", who: "Lead", l: "Responde. IA faz 4 perguntas do roteiro, trata 2 objeções." },
      { t: "14:05", who: "IA Voz", l: "Avalia: qualificado. Abre agenda do Bruno, marca quinta 14h." },
      { t: "14:06", who: "Vendedor", l: "Recebe resumo: transcrição + sentimento + próxima ação." },
    ],
  },
  {
    id: "social",
    tag: "Conteúdo que vende",
    title:
      "A IA vê qual anúncio tá performando e reposta o mesmo conteúdo no orgânico pra economizar verba.",
    time: "Calendário em 6 redes · aprovação por link",
    steps: [
      { t: "Seg", who: "IA", l: "Identifica criativo A com CTR 3.2× maior que os outros." },
      { t: "Seg", who: "IA", l: "Adapta legenda e formato pra Instagram, LinkedIn, TikTok e Facebook." },
      { t: "Ter", who: "Cliente", l: "Recebe link externo (sem login) e aprova em lote." },
      { t: "Qua", who: "Sistema", l: "Publica automaticamente nas 4 redes no melhor horário de cada uma." },
      { t: "Sex", who: "BI", l: "Mostra: orgânico gerou +R$ 14k sem custo de mídia." },
    ],
  },
  {
    id: "close",
    tag: "Do sim ao contrato",
    title:
      "Cliente falou sim no WhatsApp. Proposta, contrato e assinatura saem sem sair da tela.",
    time: "Assinatura com validade jurídica · Lei 14.063",
    steps: [
      { t: "T+0", who: "Vendedor", l: "Clica “Nova proposta” no negócio. Dados do cliente e preço puxados do CRM." },
      { t: "T+1m", who: "Sistema", l: "Envia link pro WhatsApp do cliente com token único." },
      { t: "T+18m", who: "Cliente", l: "Abre, lê 4 minutos (plataforma mostra o tracking), clica “aceitar”." },
      { t: "T+19m", who: "Sistema", l: "Gera contrato com variáveis, envia pra assinatura eletrônica." },
      { t: "T+42m", who: "Cliente", l: "Assina pelo celular. PDF com hash SHA-256 e QR no e-mail." },
    ],
  },
];

function FlowCard({
  flow,
  idx,
  active,
  onOpen,
}: {
  flow: Flow;
  idx: number;
  active: string | null;
  onOpen: (id: string | null) => void;
}) {
  const open = active === flow.id;
  const stepsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const root = stepsRef.current;
    if (!root) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    if (items.length === 0) return;
    if (reduced) {
      for (const item of items) item.style.opacity = "1";
      return;
    }
    for (const item of items) {
      item.style.opacity = "0";
      item.style.transform = "translateY(6px)";
    }
    animate(items, {
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 500,
      delay: stagger(60),
      ease: "outExpo",
    });
  }, [open]);

  return (
    <div data-flow className="overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[color:var(--panel)] transition-all">
      <button
        onClick={() => onOpen(open ? null : flow.id)}
        className="grid w-full cursor-pointer grid-cols-[60px_1fr_auto] items-center gap-6 border-0 bg-transparent px-6 py-7 text-left md:px-8"
      >
        <div
          className="grid h-[52px] w-[52px] place-items-center rounded-[16px] text-[13px] font-semibold tracking-[.02em] transition-all"
          style={{
            background: open ? "var(--ink)" : "var(--bg-2)",
            color: open ? "var(--bg)" : "var(--ink-3)",
            border: open ? "none" : "1px solid var(--line)",
          }}
        >
          {String(idx + 1).padStart(2, "0")}
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--accent)]">
            {flow.tag}
          </div>
          <div className="text-xl font-medium leading-[1.25] tracking-[-0.02em] text-[color:var(--ink)]">
            {flow.title}
          </div>
        </div>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[color:var(--line-2)] transition-transform"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          <Plus
            style={{ width: 14, height: 14 }}
            className="text-[color:var(--ink-3)]"
          />
        </span>
      </button>

      {open && (
        <div ref={stepsRef} className="grid grid-cols-[60px_1fr] gap-6 px-6 pb-8 md:px-8">
          <div />
          <div>
            <div className="mb-4 text-xs font-medium uppercase tracking-[.04em] text-[color:var(--accent)]">
              {flow.time}
            </div>
            <div className="relative">
              <div className="absolute bottom-2.5 left-[7px] top-2.5 w-px bg-[color:var(--line-2)]" />
              {flow.steps.map((s, i) => (
                <div
                  key={i}
                  data-step
                  className="grid grid-cols-[16px_90px_1fr] items-start gap-4 py-2"
                >
                  <div
                    className="mt-1 h-3.5 w-3.5 rounded-full bg-[color:var(--panel)]"
                    style={{ border: "2px solid var(--accent)" }}
                  />
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.04em] text-[color:var(--ink-4)]">
                    <div>{s.t}</div>
                    <div className="mt-0.5 text-[color:var(--accent)]">{s.who}</div>
                  </div>
                  <div className="pt-0.5 text-[14.5px] leading-[1.5] text-[color:var(--ink-2)]">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LandingFlows() {
  const [active, setActive] = useState<string | null>("ads2sale");
  const listRef = useScrollStagger<HTMLDivElement>({
    selector: "[data-flow]",
    translateX: [-60, 0],
    opacity: [0, 1],
    scale: [0.96, 1],
    windowSize: 0.5,
    range: [0, 0.95],
    startVp: 0.95,
    endVp: 0.2,
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
  return (
    <section
      id="como"
      className="border-y border-[color:var(--line)] bg-[color:var(--bg-2)] py-[80px] md:py-[140px]"
    >
      <div className="mx-auto max-w-[1080px] px-6 md:px-8">
        <div className="mx-auto max-w-[900px] text-center">
          <div className="mb-6">
            <span className="kicker">Fluxos do dia a dia</span>
          </div>
          <h2
            ref={headingRef}
            className="m-0 font-semibold leading-[1.02] tracking-[-0.04em]"
            style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
          >
            4 cenários <span className="text-[color:var(--accent)]">·</span> rodando
            <br />
            enquanto você não tá olhando.
          </h2>
        </div>
        <p ref={subRef} className="mx-auto mt-6 max-w-[680px] text-center text-lg text-[color:var(--ink-3)]">
          Não é uma promessa abstrata. São passos reais, minuto a minuto, do que a plataforma
          executa enquanto sua equipe foca em fechar.
        </p>

        <div ref={listRef} className="mt-16 flex flex-col gap-3">
          {FLOWS.map((f, i) => (
            <FlowCard
              key={f.id}
              flow={f}
              idx={i}
              active={active}
              onOpen={setActive}
            />
          ))}
        </div>

        <div className="mt-12 text-center text-[13px] text-[color:var(--ink-4)]">
          + 8 outros fluxos automatizados: otimização IA de 2 em 2 dias, relatório white-label,
          dunning de pagamento, lead scoring, retargeting automático…
        </div>
      </div>
    </section>
  );
}
