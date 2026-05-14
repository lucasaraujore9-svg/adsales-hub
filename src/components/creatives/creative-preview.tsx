/**
 * Preview de criativo em mockups de cada formato.
 * Mockups são CSS simples (não imagens reais de iPhone) — bom enough para MVP.
 */

interface Props {
  imageUrl: string;
  headline?: string | null;
  bodyText?: string | null;
  cta?: string | null;
}

export function CreativePreview({ imageUrl, headline, bodyText, cta }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PreviewCard title="Instagram Feed (1:1)">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[color:var(--bg-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="creative" className="h-full w-full object-cover" />
        </div>
        {headline && <p className="px-3 pt-2 text-sm font-medium">{headline}</p>}
        {bodyText && <p className="px-3 text-xs text-[color:var(--ink-3)]">{bodyText}</p>}
        {cta && (
          <div className="border-t border-[color:var(--line)] p-2 text-center">
            <span className="text-xs font-medium">{cta}</span>
          </div>
        )}
      </PreviewCard>

      <PreviewCard title="Instagram Stories (9:16)">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "9/16" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="creative" className="h-full w-full object-cover" />
          {headline && (
            <div className="absolute inset-x-0 bottom-12 px-4 text-center">
              <p className="text-sm font-semibold text-white drop-shadow">{headline}</p>
            </div>
          )}
          {cta && (
            <div className="absolute inset-x-4 bottom-4 rounded-full bg-white py-2 text-center text-xs font-semibold text-black">
              {cta}
            </div>
          )}
        </div>
      </PreviewCard>

      <PreviewCard title="Facebook Feed (4:5)">
        <div className="border-b border-[color:var(--line)] p-2 text-xs text-[color:var(--ink-3)]">
          Patrocinado
        </div>
        {bodyText && <p className="px-3 py-2 text-xs">{bodyText}</p>}
        <div
          className="w-full overflow-hidden bg-[color:var(--bg-2)]"
          style={{ aspectRatio: "4/5" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="creative" className="h-full w-full object-cover" />
        </div>
        {headline && (
          <p className="border-t border-[color:var(--line)] px-3 py-2 text-sm font-medium">
            {headline}
          </p>
        )}
        {cta && (
          <div className="bg-[color:var(--bg-2)] px-3 py-2 text-xs font-medium">
            {cta} →
          </div>
        )}
      </PreviewCard>
    </div>
  );
}

function PreviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
      <div className="border-b border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-1.5">
        <p className="text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}
