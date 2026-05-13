import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { PublicFormEmbed } from "@/components/public/form-embed";

interface FormRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  fields: unknown;
  is_active: boolean;
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
  const { data } = await sb.from("forms").select("name").eq("slug", slug).maybeSingle();
  const f = data as { name?: string } | null;
  return { title: f?.name ?? "Formulario" };
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = createAdminSupabaseClient();
  const { data } = await sb
    .from("forms")
    .select("id, workspace_id, name, slug, fields, is_active, thank_you_message")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  const form = data as FormRow | null;
  if (!form) notFound();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">{form.name}</h1>
        <PublicFormEmbed
          slug={form.slug}
          fields={form.fields}
          thankYou={form.thank_you_message}
        />
      </div>
    </div>
  );
}
