"use client";

import { useState, type ReactElement } from "react";
import { Check } from "./icons";
import {
  useCrossfade,
  useMouseTilt,
  useScrollAnimate,
  useScrollWordReveal,
} from "@/lib/animations";

interface Module {
  id: string;
  name: string;
  tag: string;
  title: string;
  desc: string;
  metrics: [string, string][];
  what: string;
}

const MODULES: Module[] = [
  {
    id: "crm",
    name: "CRM",
    tag: "VENDAS",
    title: "O cadastro da venda no mesmo lugar do anúncio que a trouxe.",
    desc:
      "Kanban drag-and-drop, 5 funis prontos, atividades, ligações gravadas e 19 automações. Cada negócio carrega a origem — qual anúncio, qual campanha, quanto custou o lead.",
    metrics: [["Funis prontos", "5"], ["Automações", "19"]],
    what:
      "“Lista dos seus leads e clientes, mostrando de onde veio cada um e em que etapa da venda estão — sem planilha.”",
  },
  {
    id: "ads",
    name: "Tráfego IA",
    tag: "ANÚNCIOS",
    title: "Do briefing escrito à campanha publicada em 4 passos.",
    desc:
      "Você escreve em português o que quer vender. A IA gera público, copy, 3 criativos A/B, formulário e publica direto no Meta. Otimização contínua a cada 2 dias.",
    metrics: [["Passos", "4"], ["Variantes", "3 A/B"]],
    what:
      "“Cria e gerencia seus anúncios no Instagram, Facebook e Google. Substitui agência e gestor de tráfego.”",
  },
  {
    id: "social",
    name: "Social",
    tag: "CONTEÚDO",
    title: "Calendário em 6 redes com IA replicando o que vende.",
    desc:
      "Instagram, Facebook, LinkedIn, TikTok, YouTube e Pinterest. A IA sugere legenda, hashtag e horário, adapta o mesmo post para cada rede e publica automático.",
    metrics: [["Redes", "6"], ["Aprovação", "link externo"]],
    what:
      "“Posta e mantém suas redes sociais no ar. Substitui social media e designer.”",
  },
  {
    id: "msg",
    name: "Atendimento",
    tag: "MENSAGENS",
    title: "WhatsApp, e-mail e SMS numa régua só, com bot que qualifica.",
    desc:
      "Templates, sequências automáticas por evento do funil. O bot responde, qualifica e só transfere pro humano quando for hora de fechar.",
    metrics: [["Abertura WA", "93%"], ["Resposta", "47%"]],
    what:
      "“Central única de conversas com clientes: WhatsApp, e-mail e SMS. A IA responde o básico pra você focar no que fecha.”",
  },
  {
    id: "sdr",
    name: "SDR de Voz",
    tag: "LIGAÇÃO IA",
    title: "Agente de voz que liga, qualifica em 90s e agenda a reunião.",
    desc:
      "Script, tom de voz e horário você define. A IA liga pelo telefone, conversa, avalia, e se qualificar marca reunião direto na agenda do vendedor.",
    metrics: [["Qualif. média", "90s"], ["Tentativas", "3×"]],
    what:
      "“Um funcionário de IA que liga pros seus leads, faz perguntas e agenda reunião com o vendedor. Liga enquanto você dorme.”",
  },
  {
    id: "bi",
    name: "Analytics",
    tag: "RESULTADO",
    title: "Quanto cada anúncio virou em receita de verdade.",
    desc:
      "Funil completo do clique ao ganho. CAC, ROAS, LTV, payback. Pergunte em português — a IA responde com gráfico e próxima ação.",
    metrics: [["Relatórios", "6 tipos"], ["White-label", "Sim"]],
    what:
      "“Mostra, de cada real gasto em anúncio, quanto voltou em venda fechada — e o que fazer em seguida.”",
  },
  {
    id: "site",
    name: "Landing Pages",
    tag: "CAPTAÇÃO",
    title: "Páginas e formulários que alimentam o pipeline direto.",
    desc:
      "Editor drag-and-drop, templates por nicho, domínio próprio com SSL, A/B testing e lead caindo direto no funil com UTM e origem completa.",
    metrics: [["Templates", "8+ nichos"], ["Lead → CRM", "auto"]],
    what:
      "“Sites de uma página pra capturar contato de interessado. Conecta direto na lista de leads.”",
  },
  {
    id: "sign",
    name: "Contratos",
    tag: "ASSINATURA",
    title: "Proposta, contrato e assinatura sem sair do CRM.",
    desc:
      "Template com variáveis, dados do negócio auto-preenchidos, envio por e-mail ou WhatsApp, assinatura com validade jurídica (Lei 14.063/2020) e QR de verificação.",
    metrics: [["Validade", "jurídica"], ["Tracking", "abertura + tempo"]],
    what:
      "“Envia proposta pro cliente, ele assina pelo celular, virou venda. Sem imprimir, sem reconhecer firma.”",
  },
];

function ModuleVisual({ id }: { id: string }): ReactElement {
  if (id === "crm") {
    const cols: [string, number, string[]][] = [
      ["Captado", 12, ["Mariana", "Pedro", "Fátima"]],
      ["Qualif.", 7, ["Nexus", "Orbe"]],
      ["Proposta", 3, ["Agroferro"]],
      ["Fechado", 2, ["Mercado Duplo"]],
    ];
    return (
      <div className="grid w-full max-w-[440px] grid-cols-4 gap-1.5">
        {cols.map(([l, n, deals], ci) => (
          <div
            key={l}
            className="min-h-[220px] rounded-[10px] border border-[color:var(--line)] bg-[color:var(--panel)] p-2"
          >
            <div className="mb-2 flex justify-between text-[9px] font-semibold uppercase tracking-[.08em] text-[color:var(--ink-4)]">
              <span>{l}</span>
              <span>{n}</span>
            </div>
            {deals.map((d) => (
              <div
                key={d}
                className="mb-1 rounded-md px-2 py-1.5 text-[10px] font-medium"
                style={{
                  background: ci === 3 ? "var(--ink)" : "var(--bg-2)",
                  color: ci === 3 ? "var(--bg)" : "var(--ink)",
                }}
              >
                {d}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (id === "ads") {
    const items: [string, boolean][] = [
      ["Sexta-feira\nsalva.", true],
      ["Sua planilha\nmerece +.", false],
      ["Excel que\nvale curso.", false],
    ];
    return (
      <div className="grid w-full max-w-[380px] grid-cols-3 gap-2.5">
        {items.map(([t, win], i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[14px] bg-[color:var(--panel)]"
            style={{
              border: win ? "2px solid var(--accent)" : "1px solid var(--line)",
            }}
          >
            <div
              className="grid aspect-[4/5] place-items-center p-3.5"
              style={{
                background: win
                  ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                  : "linear-gradient(135deg, #1F1F23, #0E0E10)",
              }}
            >
              <div
                className="whitespace-pre-line text-center text-base font-bold leading-tight tracking-[-0.02em]"
                style={{ color: win ? "#fff" : "rgba(250,250,247,.4)" }}
              >
                {t}
              </div>
            </div>
            <div
              className="px-2.5 py-[7px] text-center text-[10px] font-semibold tracking-[.06em]"
              style={{ color: win ? "var(--good)" : "var(--ink-4)" }}
            >
              {win ? "VENCEDOR" : "—"}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (id === "social") {
    return (
      <div className="w-full max-w-[380px]">
        <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
          Calendário · esta semana
        </div>
        <div className="grid grid-cols-7 gap-1 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-2">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <div
              key={i}
              className="py-[3px] text-center text-[10px] text-[color:var(--ink-4)]"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: 21 }).map((_, i) => {
            const has = [0, 2, 3, 5, 8, 10, 11, 13, 15, 17, 19].includes(i);
            const type = i % 3 === 0 ? "IG" : i % 3 === 1 ? "LI" : "TT";
            return (
              <div
                key={i}
                className="grid aspect-square place-items-center rounded-md text-[9px] font-semibold"
                style={{
                  background: has ? "var(--accent-soft)" : "var(--bg-2)",
                  color: has ? "var(--accent-ink)" : "var(--ink-5)",
                }}
              >
                {has ? type : ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (id === "msg") {
    const msgs: { c: string; t: string; own: boolean; sys?: boolean }[] = [
      { c: "WA · T+0", t: "Oi Mariana! Vi seu cadastro no curso.", own: false },
      { c: "VOCÊ · T+3m", t: "Oi! Vocês têm turma pra quinta?", own: true },
      { c: "IA · T+3m", t: "Sim — próxima turma inicia em 15/mar.", own: false },
      { c: "E-MAIL · T+1h", t: "Programa completo em PDF", own: false },
      { c: "SDR · T+2h", t: "Bruno chamando · follow-up agendado", own: false, sys: true },
    ];
    return (
      <div className="w-full max-w-[320px] rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
          Sequência Boas-vindas
        </div>
        {msgs.map((m, i) => (
          <div
            key={i}
            className="mb-2.5 flex flex-col"
            style={{ alignItems: m.own ? "flex-end" : "flex-start" }}
          >
            <div
              className="mb-0.5 text-[9px] font-semibold tracking-[.06em]"
              style={{ color: m.sys ? "var(--accent)" : "var(--ink-4)" }}
            >
              {m.c}
            </div>
            <div
              className="max-w-[85%] rounded-[12px] px-3 py-1.5 text-xs"
              style={{
                background: m.own ? "var(--accent)" : "var(--bg-2)",
                color: m.own ? "#fff" : "var(--ink)",
                border: m.own ? "none" : "1px solid var(--line)",
              }}
            >
              {m.t}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (id === "sdr") {
    const bars: { t: string; l: string; own: boolean; sys?: boolean }[] = [
      { t: "0s", l: "IA · Olá, sou a Clara da AdSales. Tem 2 min?", own: false },
      { t: "4s", l: "Tenho sim.", own: true },
      { t: "8s", l: "Você baixou nosso material sobre automação. Qual seu desafio hoje?", own: false },
      { t: "22s", l: "Estou escalando time e CRM tá uma bagunça.", own: true },
      { t: "60s", l: "Qualificado ✓ · Agendando reunião com Bruno, quinta 14h.", own: false, sys: true },
    ];
    return (
      <div className="w-full max-w-[340px] rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-[18px]">
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
              Ligação · ao vivo
            </div>
            <div className="mt-0.5 text-sm font-medium">Mariana Costa · 00:62s</div>
          </div>
          <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[.08em] text-[color:var(--accent)]">
            IA
          </span>
        </div>
        <div className="flex max-h-[220px] flex-col gap-2 overflow-hidden">
          {bars.map((m, i) => (
            <div
              key={i}
              className="flex flex-col"
              style={{ alignItems: m.own ? "flex-end" : "flex-start" }}
            >
              <div
                className="mb-0.5 text-[9px] font-semibold tracking-[.06em]"
                style={{ color: m.sys ? "var(--accent)" : "var(--ink-4)" }}
              >
                {m.t}
              </div>
              <div
                className="max-w-[90%] rounded-[12px] px-3 py-1.5 text-[11.5px]"
                style={{
                  background: m.own
                    ? "var(--accent)"
                    : m.sys
                      ? "var(--ink)"
                      : "var(--bg-2)",
                  color: m.own || m.sys ? "#fff" : "var(--ink)",
                  border: m.own || m.sys ? "none" : "1px solid var(--line)",
                }}
              >
                {m.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "bi") {
    const bars = [20, 28, 22, 35, 42, 48, 52, 58, 44, 62, 68, 74, 81, 88];
    return (
      <div className="w-full max-w-[380px]">
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] p-[18px]">
          <div className="text-[11px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
            RECEITA × CUSTO
          </div>
          <div className="mt-1.5 text-[26px] font-medium tracking-[-0.025em]">
            R$ 184.420 <span className="text-[13px] text-[color:var(--good)]">· ROAS 4.1x</span>
          </div>
          <div className="mt-3.5 flex h-[60px] items-end gap-[3px]">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[3px]"
                style={{
                  height: `${h}%`,
                  background: i >= 10 ? "var(--accent)" : "var(--line-2)",
                }}
              />
            ))}
          </div>
          <div className="mt-3.5 flex gap-2 rounded-[10px] bg-[color:var(--accent-soft)] p-2.5 text-[11.5px] text-[color:var(--ink-2)]">
            <span className="font-semibold text-[color:var(--accent)]">IA:</span> “Duplica o
            orçamento do Anúncio A. Retorno esperado: +R$ 22k em 7 dias.”
          </div>
        </div>
      </div>
    );
  }

  if (id === "site") {
    return (
      <div className="w-full max-w-[360px]">
        <div className="overflow-hidden rounded-[14px] border border-[color:var(--line)] bg-[color:var(--panel)]">
          <div
            className="p-[22px] text-center text-white"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            }}
          >
            <div className="text-[22px] font-semibold leading-[1.1] tracking-[-0.02em]">
              Escale sua operação
              <br />
              em 14 dias.
            </div>
            <div className="mt-1.5 text-[11px] opacity-90">Sem cartão · Setup guiado</div>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {["Nome", "E-mail", "WhatsApp", "Segmento"].map((l, i) => (
              <div
                key={l}
                className="rounded-[8px] border border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-2 text-[11px]"
                style={{ color: i < 2 ? "var(--ink)" : "var(--ink-4)" }}
              >
                {i === 0 ? "Mariana Costa" : i === 1 ? "mariana@nexus.com" : l}
              </div>
            ))}
            <div className="mt-1 rounded-[8px] bg-[color:var(--ink)] px-3 py-2.5 text-center text-[11px] font-medium text-white">
              Quero começar →
            </div>
          </div>
        </div>
        <div className="mt-2.5 text-center text-[10px] text-[color:var(--ink-4)]">
          meudominio.com.br · SSL ativo · UTM capturado
        </div>
      </div>
    );
  }

  // sign
  return (
    <div className="w-full max-w-[340px] rounded-[14px] border border-[color:var(--line)] bg-[color:var(--panel)] p-[18px]">
      <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-[color:var(--ink-4)]">
        PROPOSTA Nº 184
      </div>
      <div className="mt-1.5 text-[17px] font-medium tracking-[-0.015em]">
        Mercado Duplo · Consultoria
      </div>
      <div className="mt-3.5 text-xs leading-[1.6] text-[color:var(--ink-3)]">
        <div className="flex justify-between border-b border-dashed border-[color:var(--line)] py-1.5">
          <span>Setup + treinamento</span>
          <span>R$ 4.800</span>
        </div>
        <div className="flex justify-between border-b border-dashed border-[color:var(--line)] py-1.5">
          <span>Mensalidade (12m)</span>
          <span>R$ 990/mês</span>
        </div>
        <div className="flex justify-between py-1.5 text-[13px] font-semibold text-[color:var(--ink)]">
          <span>Total 1º ano</span>
          <span>R$ 16.680</span>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-2.5 rounded-[10px] bg-[color:var(--bg-2)] p-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--accent-soft)]">
          <Check
            style={{ width: 16, height: 16, color: "var(--accent)" }}
          />
        </div>
        <div className="flex-1">
          <div className="text-[11.5px] font-medium">Assinado por Marcelo A.</div>
          <div className="text-[10px] text-[color:var(--ink-4)]">
            Hash SHA-256 · QR · Lei 14.063
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingModules() {
  const [active, setActive] = useState("crm");
  const m = MODULES.find((x) => x.id === active) ?? MODULES[0];
  const copyRef = useCrossfade<HTMLDivElement>(active, { distance: 6, duration: 420 });
  const visualRef = useCrossfade<HTMLDivElement>(active, { distance: 8, duration: 460 });
  const headingRef = useScrollWordReveal<HTMLHeadingElement>({
    distance: 60,
    rotate: 6,
    windowSize: 0.32,
    range: [0, 0.8],
    startVp: 0.95,
    endVp: 0.5,
  });
  const tabsRef = useScrollAnimate<HTMLDivElement>({
    translateY: [40, 0],
    opacity: [0, 1],
    range: [0.1, 0.7],
    startVp: 0.95,
    endVp: 0.45,
  });
  const containerSceneRef = useScrollAnimate<HTMLDivElement>({
    translateY: [80, 0],
    scale: [0.92, 1],
    rotateX: [10, 0],
    opacity: [0, 1],
    perspective: 1800,
    range: [0, 0.6],
    startVp: 0.95,
    endVp: 0.3,
  });
  const containerTiltRef = useMouseTilt<HTMLDivElement>({
    max: 4,
    perspective: 1600,
  });

  return (
    <section id="modulos" className="py-[120px] md:py-[140px]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="mx-auto max-w-[860px] text-center">
          <div className="mb-6">
            <span className="kicker">A plataforma</span>
          </div>
          <h2
            ref={headingRef}
            className="m-0 font-semibold leading-[1.02] tracking-[-0.04em]"
            style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
          >
            8 módulos <span className="text-[color:var(--accent)]">·</span> 1 sistema{" "}
            <span className="text-[color:var(--accent)]">·</span>
            <br />
            mesmo dado do clique ao contrato.
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-[640px] text-center text-lg text-[color:var(--ink-3)]">
          Não é integração. É o mesmo dado, o mesmo cliente e a mesma IA, do primeiro clique até o
          contrato assinado.
        </p>

        <div
          ref={tabsRef}
          className="mt-10 -mx-6 overflow-x-auto px-6 md:mx-0 md:mt-14 md:overflow-visible md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex w-max gap-1 rounded-[18px] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-1.5 md:grid md:w-auto md:grid-cols-8">
            {MODULES.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActive(mod.id)}
                className="shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-[14px] border-0 px-3.5 py-2.5 text-[13px] font-medium tracking-[-0.005em] transition-all md:px-2 md:py-3 md:text-[12.5px]"
                style={{
                  background: active === mod.id ? "var(--panel)" : "transparent",
                  color: active === mod.id ? "var(--ink)" : "var(--ink-3)",
                  boxShadow:
                    active === mod.id ? "0 2px 8px rgba(0,0,0,.05)" : "none",
                }}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>

        <div ref={containerSceneRef} className="mt-8">
          <div
            ref={containerTiltRef}
            className="overflow-hidden rounded-[26px] border border-[color:var(--line)] bg-[color:var(--panel)]"
            style={{ boxShadow: "0 30px 80px -30px rgba(10,10,20,.12)" }}
          >
            <div className="grid min-h-[500px] grid-cols-1 md:grid-cols-2">
            <div
              ref={copyRef}
              className="flex flex-col justify-center p-10 md:p-14"
              key={m.id}
            >
              <div className="mb-6 inline-flex w-fit rounded-full border border-[color:var(--line)] bg-[color:var(--bg-2)] px-2.5 py-1 text-[10.5px] font-semibold tracking-[.12em] text-[color:var(--ink-4)]">
                {m.tag}
              </div>
              <h3
                className="m-0 font-medium leading-[1.1] tracking-[-0.025em]"
                style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
              >
                {m.title}
              </h3>
              <p className="mt-5 max-w-[440px] text-base leading-[1.55] text-[color:var(--ink-3)]">
                {m.desc}
              </p>

              <div
                className="mt-5 max-w-[440px] rounded-r-[10px] rounded-l-[4px] bg-[color:var(--accent-soft)] p-3.5 text-sm leading-[1.5] text-[color:var(--ink-2)]"
                style={{ borderLeft: "3px solid var(--accent)" }}
              >
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[.1em] text-[color:var(--accent)]">
                  EM MIÚDOS
                </span>
                {m.what}
              </div>

              <div className="mt-7 flex gap-10">
                {m.metrics.map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[26px] font-medium tracking-[-0.025em] text-[color:var(--accent)]">
                      {v}
                    </div>
                    <div className="mt-0.5 text-xs text-[color:var(--ink-4)]">{k}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              ref={visualRef}
              key={`v-${m.id}`}
              className="grid place-items-center border-t border-[color:var(--line)] bg-[color:var(--bg-2)] p-8 md:border-l md:border-t-0"
            >
              <ModuleVisual id={m.id} />
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
