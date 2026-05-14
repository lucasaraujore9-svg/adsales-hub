import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { LpPublicRenderer } from "@/components/public/lp-renderer";

interface LpRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  content: unknown;
  meta_pixel_id: string | null;
  published: boolean;
  seo: unknown;
}

interface FormRow {
  id: string;
  name: string;
  slug: string;
  fields: unknown;
  thank_you_message: string | null;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = createAdminSupabaseClient();
  const { data } = await sb
    .from("landing_pages")
    .select("name, seo")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  const lp = data as { name?: string; seo?: { title?: string; description?: string } | null } | null;
  if (!lp) return { title: "Pagina não encontrada" };
  const seo = lp.seo ?? null;
  return {
    title: seo?.title ?? lp.name,
    description: seo?.description,
  };
}

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = createAdminSupabaseClient();
  const { data } = await sb
    .from("landing_pages")
    .select("id, workspace_id, name, slug, content, meta_pixel_id, published, seo")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  const lp = data as LpRow | null;
  if (!lp) notFound();

  // Fetch any form referenced in blocks
  const rawContent = lp.content as { blocks?: unknown } | null;
  const rawBlocks = Array.isArray(rawContent?.blocks) ? (rawContent!.blocks as unknown[]) : [];
  const formIds = new Set<string>();
  for (const b of rawBlocks) {
    if (typeof b === "object" && b !== null && typeof (b as Record<string, unknown>).form_id === "string") {
      formIds.add((b as Record<string, unknown>).form_id as string);
    }
  }
  let forms: FormRow[] = [];
  if (formIds.size > 0) {
    const { data: formsData } = await sb
      .from("forms")
      .select("id, name, slug, fields, thank_you_message")
      .in("id", [...formIds])
      .eq("workspace_id", lp.workspace_id)
      .eq("is_active", true);
    forms = (formsData ?? []) as unknown as FormRow[];
  }

  return <LpPublicRenderer lp={lp} blocks={rawBlocks} forms={forms} />;
}
