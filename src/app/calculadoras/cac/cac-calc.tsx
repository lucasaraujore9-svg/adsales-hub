"use client";

import { useState } from "react";
import { CalcShell, Field, ResultLine, fmtBRL } from "@/components/calculators/calc-shell";

export function CacCalc() {
  const [media, setMedia] = useState("3000");
  const [salaries, setSalaries] = useState("8000");
  const [tools, setTools] = useState("1500");
  const [agency, setAgency] = useState("2500");
  const [customers, setCustomers] = useState("12");

  const total = (Number(media) || 0) + (Number(salaries) || 0) + (Number(tools) || 0) + (Number(agency) || 0);
  const c = Number(customers) || 0;
  const cac = c > 0 ? total / c : 0;
  const onlyMedia = c > 0 ? Number(media) / c : 0;
  const overhead = cac - onlyMedia;

  return (
    <CalcShell
      result={
        <>
          <div className="kicker mb-4">Resultado</div>
          <ResultLine label="CAC real" value={fmtBRL(cac)} highlight />
          <ResultLine label="Custo total da operação" value={fmtBRL(total)} />
          <ResultLine label="CAC só com mídia" value={fmtBRL(onlyMedia)} />
          <ResultLine label="Overhead por cliente" value={fmtBRL(overhead)} />
          <p className="mt-5 text-[12.5px] text-[color:var(--ink-3)]">
            {overhead > onlyMedia
              ? "Seu overhead é maior que o gasto em mídia. Automação (SDR de IA, CRM unificado) pode cortar pela metade."
              : "Operação enxuta. Foque em reduzir CPL e aumentar conversão pra escalar."}
          </p>
        </>
      }
    >
      <div className="kicker mb-5">Custos do mês</div>
      <Field label="Investimento em mídia paga" value={media} onChange={setMedia} prefix="R$" hint="Meta + Google + TikTok + etc." />
      <Field label="Salários equipe M&S" value={salaries} onChange={setSalaries} prefix="R$" hint="Total bruto incluindo encargos" />
      <Field label="Ferramentas (CRM, e-mail, etc)" value={tools} onChange={setTools} prefix="R$" hint="SaaS pagos pela operação" />
      <Field label="Agência / freelancers" value={agency} onChange={setAgency} prefix="R$" hint="Custo mensal de terceiros" />
      <Field label="Novos clientes adquiridos" value={customers} onChange={setCustomers} suffix="clientes" hint="No mesmo período dos custos" />
    </CalcShell>
  );
}
