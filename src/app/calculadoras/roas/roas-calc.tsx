"use client";

import { useState } from "react";
import { CalcShell, Field, ResultLine, fmtBRL, fmtX } from "@/components/calculators/calc-shell";

export function RoasCalc() {
  const [revenue, setRevenue] = useState("9200");
  const [spend, setSpend] = useState("2000");
  const [margin, setMargin] = useState("30");

  const r = Number(revenue) || 0;
  const s = Number(spend) || 0;
  const m = (Number(margin) || 0) / 100;

  const roas = s > 0 ? r / s : 0;
  const breakeven = m > 0 ? 1 / m : 0;
  const profit = r * m - s;
  const status =
    s === 0 ? "—" : roas >= breakeven ? "Lucrativo" : "Prejuízo";

  return (
    <CalcShell
      result={
        <>
          <div className="kicker mb-4">Resultado</div>
          <ResultLine label="ROAS" value={fmtX(roas)} highlight />
          <ResultLine label="ROAS de breakeven" value={fmtX(breakeven)} />
          <ResultLine label="Lucro estimado (após CMV)" value={fmtBRL(profit)} />
          <ResultLine label="Status" value={status} />
          <p className="mt-5 text-[12.5px] text-[color:var(--ink-3)]">
            {roas >= breakeven * 1.5
              ? "ROAS saudável. Considere escalar o orçamento gradualmente (10-20% por semana)."
              : roas >= breakeven
                ? "Você está no positivo, mas com margem apertada. Otimize criativos e públicos."
                : "Abaixo do breakeven. Pause os anúncios pior performance e teste novos criativos."}
          </p>
        </>
      }
    >
      <div className="kicker mb-5">Insira os números</div>
      <Field label="Receita gerada pela campanha" value={revenue} onChange={setRevenue} prefix="R$" hint="Soma das vendas atribuídas à campanha" />
      <Field label="Investimento em mídia" value={spend} onChange={setSpend} prefix="R$" hint="Total gasto no Meta Ads, Google Ads, etc" />
      <Field label="Margem de contribuição" value={margin} onChange={setMargin} suffix="%" hint="(Preço − CMV) ÷ Preço × 100" />
    </CalcShell>
  );
}
