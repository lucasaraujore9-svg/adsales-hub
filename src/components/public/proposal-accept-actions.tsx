"use client";

import { useState } from "react";

export function ProposalAcceptActions({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [reason, setReason] = useState("");

  async function handle(action: "accept" | "decline") {
    setBusy(true);
    const body =
      action === "decline" ? { reason } : {};
    try {
      const resp = await fetch(`/api/proposals/${token}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (resp.ok) {
        window.location.reload();
      } else {
        const j = await resp.json().catch(() => ({}));
        alert((j as { error?: string }).error ?? "Erro");
      }
    } finally {
      setBusy(false);
    }
  }

  if (showDecline) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 p-6">
        <p className="text-sm font-medium text-slate-700">
          Pode contar o que faltou pra fechar?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          placeholder="Ex: preco fora do orcamento, não e o momento, escolhi concorrente..."
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDecline(false)}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => handle("decline")}
            disabled={busy}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {busy ? "Enviando..." : "Confirmar recusa"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handle("accept")}
        disabled={busy}
        className="block w-full rounded-full bg-orange-500 px-6 py-4 text-base font-medium text-white transition-transform hover:scale-105 disabled:opacity-60"
      >
        {busy ? "Processando..." : "Aceitar proposta"}
      </button>
      <button
        type="button"
        onClick={() => setShowDecline(true)}
        disabled={busy}
        className="block w-full rounded-full px-6 py-2 text-sm text-slate-500 hover:text-slate-700"
      >
        Recusar proposta
      </button>
      <p className="text-center text-xs text-slate-400">
        Ao aceitar, voce concorda com os termos descritos acima.
      </p>
    </div>
  );
}
