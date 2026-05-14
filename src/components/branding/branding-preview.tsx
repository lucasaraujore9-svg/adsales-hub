"use client";

interface Props {
  accentColor: string;
  logoUrl?: string | null;
  brandName?: string | null;
}

/**
 * Preview ao vivo do branding aplicado em diferentes superfícies.
 * Não afeta o app fora deste componente (CSS variables locais).
 */
export function BrandingPreview({ accentColor, logoUrl, brandName }: Props) {
  return (
    <div
      className="space-y-4"
      style={
        {
          "--preview-accent": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Sidebar mockup */}
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <p className="mb-2 text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
          Sidebar do app
        </p>
        <div className="flex h-32 overflow-hidden rounded-md border border-[color:var(--line)] bg-[color:var(--bg)]">
          <aside className="w-32 border-r border-[color:var(--line)] bg-[color:var(--bg-2)] p-3">
            <div className="mb-3 flex items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="logo" className="h-5 w-5 rounded" />
              ) : (
                <div
                  className="h-5 w-5 rounded"
                  style={{ background: accentColor }}
                />
              )}
              <span className="truncate text-xs font-medium">
                {brandName ?? "Sua empresa"}
              </span>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div
                className="rounded px-2 py-1 font-medium text-white"
                style={{ background: accentColor }}
              >
                Dashboard
              </div>
              <div className="px-2 py-1 text-[color:var(--ink-3)]">Pipeline</div>
              <div className="px-2 py-1 text-[color:var(--ink-3)]">Contatos</div>
            </div>
          </aside>
          <div className="flex-1 p-3">
            <div className="mb-2 h-3 w-20 rounded bg-[color:var(--bg-2)]" />
            <div
              className="h-6 w-16 rounded-full"
              style={{ background: accentColor }}
            />
          </div>
        </div>
      </div>

      {/* Email mockup */}
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <p className="mb-2 text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
          Email transacional
        </p>
        <div className="rounded-md border border-[color:var(--line)] bg-white p-4 text-black">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="logo" className="h-6 w-6 rounded" />
            ) : (
              <div className="h-6 w-6 rounded" style={{ background: accentColor }} />
            )}
            <span className="text-sm font-medium">{brandName ?? "Sua empresa"}</span>
          </div>
          <p className="mt-3 text-xs text-gray-700">
            Olá! Você recebeu uma proposta. Clique no botão abaixo para visualizar.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 rounded-full px-4 py-2 text-xs font-medium text-white"
            style={{ background: accentColor }}
          >
            Ver proposta →
          </button>
        </div>
      </div>

      {/* LP hero mockup */}
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <p className="mb-2 text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
          Landing page (hero)
        </p>
        <div className="rounded-md bg-[color:var(--bg)] p-6 text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="logo"
              className="mx-auto h-8 w-8 rounded"
            />
          ) : (
            <div
              className="mx-auto h-8 w-8 rounded"
              style={{ background: accentColor }}
            />
          )}
          <h3 className="mt-3 text-base font-medium">{brandName ?? "Sua empresa"}</h3>
          <p className="mt-1 text-xs text-[color:var(--ink-3)]">
            Soluções sob medida para crescer mais rápido.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 rounded-full px-5 py-1.5 text-xs font-medium text-white"
            style={{ background: accentColor }}
          >
            Começar agora
          </button>
        </div>
      </div>
    </div>
  );
}
