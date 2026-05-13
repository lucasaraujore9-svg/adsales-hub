import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { FormFieldsEditor } from "@/components/content/form-fields-editor";
import { FormSettingsForm } from "@/components/content/form-settings-form";

export const metadata = { title: "Editar formulario · AdSales Hub" };

interface FormRow {
  id: string;
  name: string;
  slug: string;
  fields: unknown;
  is_active: boolean;
  thank_you_message: string | null;
  redirect_url: string | null;
}

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "number" | "date" | "url";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const { data } = await session.supabase
    .from("forms")
    .select("id, name, slug, fields, is_active, thank_you_message, redirect_url")
    .eq("id", id)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  const form = data as FormRow | null;
  if (!form) notFound();

  const rawFields = Array.isArray(form.fields) ? (form.fields as unknown[]) : [];
  const fields: Field[] = rawFields
    .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
    .map((f) => ({
      name: String(f.name ?? ""),
      label: String(f.label ?? ""),
      type: (f.type as Field["type"]) ?? "text",
      required: Boolean(f.required),
      options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
      placeholder: typeof f.placeholder === "string" ? f.placeholder : undefined,
    }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/marketing/formularios"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Formularios
      </Link>

      <PageHeader
        kicker="Bloco C · Conteudo"
        title={form.name}
        description={`/forms/${form.slug}`}
        actions={
          <StatusBadge
            label={form.is_active ? "Ativo" : "Inativo"}
            tone={form.is_active ? "good" : "neutral"}
          />
        }
      />

      <div className="space-y-6">
        <WidgetCard kicker="Campos" title="Estrutura do formulario">
          <FormFieldsEditor formId={form.id} initialFields={fields} />
        </WidgetCard>

        <WidgetCard kicker="Configuracao" title="Pos-envio + nome">
          <FormSettingsForm
            formId={form.id}
            initialName={form.name}
            initialThanks={form.thank_you_message ?? ""}
            initialRedirect={form.redirect_url ?? ""}
          />
        </WidgetCard>
      </div>
    </div>
  );
}
