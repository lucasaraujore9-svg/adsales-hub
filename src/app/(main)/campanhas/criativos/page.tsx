import Link from "next/link";
import { Plus, Sparkles, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { listCreatives } from "@/lib/queries/marketing";
import { CreativePreviewButton } from "@/components/creatives/creative-preview-button";

export const metadata = { title: "Criativos · AdSales Hub" };

const GRADIENTS = [
  "linear-gradient(135deg,#FF5E1A,#F59E0B)",
  "linear-gradient(135deg,#3B82F6,#6366F1)",
  "linear-gradient(135deg,#10B981,#059669)",
  "linear-gradient(135deg,#EC4899,#F43F5E)",
  "linear-gradient(135deg,#A855F7,#D946EF)",
  "linear-gradient(135deg,#6B7280,#1F2937)",
];

export default async function CreativesPage() {
  const session = await getSession();
  const creatives = await listCreatives(session.supabase, session.workspaceId);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco B"
        title="Biblioteca de criativos"
        description={`${creatives.length} criativos · imagens, videos e carrosseis`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Upload className="mr-1 h-4 w-4" /> Upload
            </Button>
            <Button asChild size="sm">
              <Link href="/campanhas/criativos/gerar">
                <Sparkles className="mr-1 h-4 w-4" /> Gerar com IA
              </Link>
            </Button>
          </>
        }
      />

      {creatives.length === 0 ? (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhum criativo ainda. Faca upload ou gere com IA.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creatives.map((c, i) => {
            const previewUrl = c.thumbnail_url ?? c.file_url;
            return (
              <div
                key={c.id}
                className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]"
              >
                <div
                  className="relative aspect-square flex items-center justify-center overflow-hidden text-white/80 text-2xl font-medium"
                  style={
                    previewUrl
                      ? { background: "var(--bg-2)" }
                      : { background: GRADIENTS[i % GRADIENTS.length] }
                  }
                >
                  {previewUrl && c.type === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt={c.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : c.type === "video" ? (
                    "▶"
                  ) : c.type === "carousel" ? (
                    "◎"
                  ) : (
                    c.name.split(" ")[0]
                  )}
                  <div className="absolute left-2 top-2">
                    <StatusBadge label={c.type} tone="neutral" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-medium">{c.name}</h3>
                  {previewUrl && c.type === "image" && (
                    <div className="mt-2">
                      <CreativePreviewButton imageUrl={previewUrl} name={c.name} />
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(c.tags ?? []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-pill border border-[color:var(--line-2)] px-1.5 py-0.5 text-[10px] text-[color:var(--ink-3)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--ink-4)]">
                    Criado em {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
