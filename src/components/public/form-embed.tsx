"use client";

import { useState, type FormEvent } from "react";

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "number" | "date" | "url";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

function asField(raw: unknown): Field | null {
  if (typeof raw !== "object" || raw === null) return null;
  const f = raw as Record<string, unknown>;
  const validTypes: Field["type"][] = [
    "text",
    "email",
    "phone",
    "textarea",
    "select",
    "number",
    "date",
    "url",
  ];
  const type = (f.type as Field["type"]) ?? "text";
  if (!validTypes.includes(type)) return null;
  return {
    name: String(f.name ?? ""),
    label: String(f.label ?? ""),
    type,
    required: Boolean(f.required),
    options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
    placeholder: typeof f.placeholder === "string" ? f.placeholder : undefined,
  };
}

export function PublicFormEmbed({
  slug,
  fields: rawFields,
  thankYou,
}: {
  slug: string;
  fields: unknown;
  thankYou: string | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fields = (Array.isArray(rawFields) ? rawFields : [])
    .map(asField)
    .filter((f): f is Field => f !== null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body: Record<string, string> = {};
    formData.forEach((v, k) => {
      body[k] = String(v);
    });

    const sp =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    if (sp) {
      const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      for (const u of utms) {
        const v = sp.get(u);
        if (v) body[`__${u}`] = v;
      }
      if (typeof document !== "undefined" && document.referrer) {
        body["__referrer"] = document.referrer;
      }
    }

    try {
      const resp = await fetch(`/api/forms/${slug}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await resp.json()) as { ok: boolean; redirect?: string; error?: string };
      if (!resp.ok || !json.ok) {
        setError(json.error ?? "Erro ao enviar");
        setSubmitting(false);
        return;
      }
      if (json.redirect) {
        window.location.href = json.redirect;
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          ✓
        </div>
        <p className="text-lg text-slate-800">
          {thankYou ?? "Recebemos sua mensagem. Entraremos em contato em breve."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={`f-${f.name}`} className="block text-sm font-medium text-slate-700">
            {f.label}
            {f.required && <span className="ml-1 text-orange-500">*</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={`f-${f.name}`}
              name={f.name}
              required={f.required}
              placeholder={f.placeholder}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          ) : f.type === "select" ? (
            <select
              id={`f-${f.name}`}
              name={f.name}
              required={f.required}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {(f.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`f-${f.name}`}
              name={f.name}
              type={
                f.type === "phone"
                  ? "tel"
                  : f.type === "url"
                    ? "url"
                    : f.type === "email"
                      ? "email"
                      : f.type === "number"
                        ? "number"
                        : f.type === "date"
                          ? "date"
                          : "text"
              }
              required={f.required}
              placeholder={f.placeholder}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          )}
        </div>
      ))}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
