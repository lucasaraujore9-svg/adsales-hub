"use client";

import { useState } from "react";
import { CalcShell, Field, ResultLine, fmtBRL } from "@/components/calculators/calc-shell";

export function CplCalc() {
  const [ticket, setTicket] = useState("990");
  const [margin, setMargin] = useState("60");
  const [conv, setConv] = useState("8");

  const t = Number(ticket) || 0;
  const m = (Number(margin) || 0) / 100;
  const cv = (Number(conv) || 0) / 100;

  const cplMax = t * m * cv;
  const cplSafe = cplMax * 0.6;

  return (
    <CalcShell
      result={
        <>
          <div className="kicker mb-4">Resultado</div>
          <ResultLine label="CPL máximo (breakeven)" value={fmtBRL(cplMax)} highlight />
          <ResultLine label="CPL alvo (60% do máximo)" value={fmtBRL(cplSafe)} />
          <ResultLine label="Margem por lead alvo" value={fmtBRL(cplMax - cplSafe)} />
          <p className="mt-5 text-[12.5px] text-[color:var(--ink-3)]">
            Trabalhe com o <strong>alvo</strong>, não o máximo. 40% de folga absorve
            oscilações de conversão e dá margem pra escalar quando bater meta.
          </p>
        </>
      }
    >
      <div className="kicker mb-5">Sua oferta</div>
      <Field label="Ticket médio do produto" value={ticket} onChange={setTicket} prefix="R$" />
      <Field label="Margem de contribuição" value={margin} onChange={setMargin} suffix="%" hint="(Receita − CMV) ÷ Receita × 100" />
      <Field label="Conversão de lead em cliente" value={conv} onChange={setConv} suffix="%" hint="% dos leads que viram clientes" />
    </CalcShell>
  );
}
