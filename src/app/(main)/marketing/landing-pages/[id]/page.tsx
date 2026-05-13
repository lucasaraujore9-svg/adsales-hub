import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { LpBlocksEditor } from "@/components/content/lp-blocks-editor";
import { LpSettingsForm } from "@/components/content/lp-settings-form";

export const metadata = { title: "Editar landing page · AdSales Hub" };

interface LpRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  published: boolean;
  content: unknown;
  meta_pixel_id: string | null;
}

interface Block {
  type:
    | "hero"
    | "problem"
    | "benefits"
    | "features"
    | "testimonials"
    | "form"
    | "pricing"
    | "faq"
    | "cta"
    | "footer"
    | "custom_html";
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  form_id?: string | null;
}

export default async function LandingPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const sb = session.supabase;
  const [{ data: lpData }, { data: formsData }] = await Promise.all([
    sb
      .from("landing_pages")
      .select("id, name, slug, domain, published, content, meta_pixel_id")
      .eq("id", id)
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
    sb
      .from("forms")
      .select("id, name")
      .eq("workspace_id", session.workspaceId)
      .eq("is_active", true)
      .order("name"),
  ]);
  const lp = lpData as LpRow | null;
  if (!lp) notFound();
  const forms = (formsData ?? []) as unknown as { id: string; name: string }[];

  const rawContent = lp.content as { blocks?: unknown } | null;
  const rawBlocks = Array.isArray(rawContent?.blocks) ? (rawContent!.blocks as unknown[]) : [];
  const blocks: Block[] = rawBlocks
    .filter((b): b is Record<string, unknown> => typeof b === "object" && b !== null)
    .map((b) => ({
      type: (b.type as Block["type"]) ?? "hero",
      title: typeof b.title === "string" ? b.title : null,
      subtitle: typeof b.subtitle === "string" ? b.subtitle : null,
      body: typeof b.body === "string" ? b.body : null,
      cta_label: typeof b.cta_label === "string" ? b.cta_label : null,
      cta_url: typeof b.cta_url === "string" ? b.cta_url : null,
      form_id: typeof b.form_id === "string" ? b.form_id : null,
    }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/marketing/landing-pages"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Landing Pages
      </Link>

      <PageHeader
        kicker="Bloco C · Conteudo"
        title={lp.name}
        description={`/${lp.slug}`}
        actions={
          <StatusBadge
            label={lp.published ? "Publicada" : "Rascunho"}
            tone={lp.published ? "good" : "neutral"}
          />
        }
      />

      <div className="space-y-6">
        <WidgetCard kicker="Blocos" title="Estrutura da pagina">
          <LpBlocksEditor pageId={lp.id} initialBlocks={blocks} forms={forms} />
        </WidgetCard>

        <WidgetCard kicker="Configuracao" title="Publicacao + tracking">
          <LpSettingsForm
            pageId={lp.id}
            initialName={lp.name}
            initialPixelId={lp.meta_pixel_id ?? ""}
            slug={lp.slug}
            domain={lp.domain}
            published={lp.published}
          />
        </WidgetCard>
      </div>
    </div>
  );
}
