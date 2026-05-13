"use client";

import { useState } from "react";
import { CalcShell, Field, ResultLine, fmtBRL, fmtX } from "@/components/calculators/calc-shell";

export function LtvCacCalc() {
  const [ticket, setTicket] = useState("690");
  const [margin, setMargin] = useState("70");
  const [churn, setChurn] = useState("4");
  const [cac, setCac] = useState("1500");

  const t = Number(ticket) || 0;
  const m = (Number(margin) || 0) / 100;
  const ch = (Number(churn) || 0) / 100;
  const c = Number(cac) || 0;

  const ltv = ch > 0 ? (t * m) / ch : 0;
  const ratio = c > 0 ? ltv / c : 0;
  const payback = t * m > 0 ? c / (t * m) : 0;

  const verdict =
    ratio >= 5
      ? "Operação muito saudável — pode investir mais em aquisição."
      : ratio >= 3
        ? "Saudável. LTV/CAC ≥ 3 é o sinal verde."
        : ratio >= 1
          ? "Apertado. Foque em aumentar LTV (reduzir churn) ou cortar CAC."
          : "Insustentável. Cada cliente novo está dando prejuízo.";

  return (
    <CalcShell
      result={
        <>
          <div className="kicker mb-4">Resultado</div>
          <ResultLine label="LTV (valor do cliente)" value={fmtBRL(ltv)} />
          <ResultLine label="LTV / CAC" value={fmtX(ratio)} highlight />
          <ResultLine label="Payback do CAC" value={`${payback.toFixed(1)} meses`} />
          <p className="mt-5 text-[12.5px] text-[color:var(--ink-3)]">{verdict}</p>
        </>
      }
    >
      <div className="kicker mb-5">Sua operação SaaS</div>
      <Field label="Ticket médio mensal" value={ticket} onChange={setTicket} prefix="R$" />
      <Field label="Margem de contribuição" value={margin} onChange={setMargin} suffix="%" hint="(Receita − CMV) ÷ Receita" />
      <Field label="Churn mensal" value={churn} onChange={setChurn} suffix="%" hint="% de clientes que cancelam por mês" />
      <Field label="CAC (custo por cliente novo)" value={cac} onChange={setCac} prefix="R$" />
    </CalcShell>
  );
}
