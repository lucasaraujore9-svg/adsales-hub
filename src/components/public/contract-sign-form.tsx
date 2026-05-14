"use client";

import { useState } from "react";

export function ContractSignForm({
  token,
  signerName,
  signerEmail,
}: {
  token: string;
  signerName: string;
  signerEmail: string;
}) {
  const [type, setType] = useState<"draw" | "type">("type");
  const [typedSignature, setTypedSignature] = useState(signerName);
  const [drawnData, setDrawnData] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // canvas drawing
  const canvasRef = (el: HTMLCanvasElement | null) => {
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    function start(x: number, y: number) {
      drawing = true;
      lastX = x;
      lastY = y;
    }
    function draw(x: number, y: number) {
      if (!drawing || !ctx) return;
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    }
    function end() {
      drawing = false;
      setDrawnData(el?.toDataURL("image/png") ?? null);
    }
    el.onmousedown = (e) => start(e.offsetX, e.offsetY);
    el.onmousemove = (e) => draw(e.offsetX, e.offsetY);
    el.onmouseup = end;
    el.onmouseleave = end;
    el.ontouchstart = (e) => {
      const r = el.getBoundingClientRect();
      const t = e.touches[0];
      start(t.clientX - r.left, t.clientY - r.top);
    };
    el.ontouchmove = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const t = e.touches[0];
      draw(t.clientX - r.left, t.clientY - r.top);
    };
    el.ontouchend = end;
  };

  function clearCanvas() {
    const el = document.querySelector<HTMLCanvasElement>("#sig-canvas");
    if (!el) return;
    const ctx = el.getContext("2d");
    ctx?.clearRect(0, 0, el.width, el.height);
    setDrawnData(null);
  }

  async function handleSign(action: "sign" | "decline") {
    setError(null);
    if (action === "sign") {
      if (!agreed) {
        setError("Confirme que você leu e concorda.");
        return;
      }
      const sigData = type === "type" ? typedSignature : drawnData;
      if (!sigData) {
        setError("Forneca a assinatura.");
        return;
      }
    }
    setBusy(true);
    try {
      const body =
        action === "sign"
          ? {
              action: "sign",
              signature_type: type,
              signature_data: type === "type" ? typedSignature : drawnData,
            }
          : { action: "decline" };
      const resp = await fetch(`/api/contracts/${token}/sign`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "Erro ao processar");
        setBusy(false);
        return;
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <p className="text-slate-600">
          Assinando como{" "}
          <strong className="text-slate-800">{signerName}</strong> ({signerEmail})
        </p>
      </div>

      <div>
        <div className="mb-2 flex gap-2 rounded-full border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => setType("type")}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium ${
              type === "type" ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
          >
            Digitar
          </button>
          <button
            type="button"
            onClick={() => setType("draw")}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium ${
              type === "draw" ? "bg-slate-900 text-white" : "text-slate-500"
            }`}
          >
            Desenhar
          </button>
        </div>

        {type === "type" ? (
          <input
            type="text"
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center font-serif text-3xl italic text-slate-700 focus:border-orange-500 focus:outline-none"
            placeholder="Seu nome"
          />
        ) : (
          <div className="space-y-2">
            <canvas
              id="sig-canvas"
              ref={canvasRef}
              width={520}
              height={140}
              className="w-full touch-none rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
            />
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          Li e concordo com os termos descritos acima. Ao assinar, declaro que sou{" "}
          <strong>{signerName}</strong> e que esta assinatura tem valor legal equivalente a
          assinatura manuscrita.
        </span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleSign("sign")}
          disabled={busy}
          className="block w-full rounded-full bg-orange-500 px-6 py-4 text-base font-medium text-white transition-transform hover:scale-105 disabled:opacity-60"
        >
          {busy ? "Processando..." : "Assinar contrato"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Recusar este contrato?")) handleSign("decline");
          }}
          disabled={busy}
          className="block w-full rounded-full px-6 py-2 text-sm text-slate-500 hover:text-slate-700"
        >
          Recusar
        </button>
      </div>
    </div>
  );
}
