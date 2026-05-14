import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { SequenceStepsEditor } from "@/components/settings/sequence-steps-editor";

export const metadata = { title: "Editar sequencia · AdSales Hub" };

interface SequenceRow {
  id: string;
  name: string;
  description: string | null;
  target_entity: string;
  is_active: boolean;
}

interface StepRow {
  id: string;
  position: number;
  channel: "email" | "whatsapp" | "call" | "task" | "sms";
  delay_days: number;
  delay_hours: number;
  template_id: string | null;
  subject: string | null;
  body: string | null;
}

interface EmailTplRow {
  id: string;
  name: string;
}

export default async function SequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const sb = session.supabase;

  const { data: seqData } = await sb
    .from("sequences")
    .select("id, name, description, target_entity, is_active")
    .eq("id", id)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  const sequence = seqData as SequenceRow | null;
  if (!sequence) notFound();

  const [{ data: stepsRaw }, { data: tplRaw }] = await Promise.all([
    sb
      .from("sequence_steps")
      .select("id, position, channel, delay_days, delay_hours, template_id, subject, body")
      .eq("sequence_id", id)
      .order("position", { ascending: true }),
    sb
      .from("email_templates")
      .select("id, name")
      .eq("workspace_id", session.workspaceId)
      .eq("is_active", true)
      .order("name"),
  ]);

  const steps = (stepsRaw ?? []) as unknown as StepRow[];
  const emailTemplates = (tplRaw ?? []) as unknown as EmailTplRow[];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes/sequencias"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Sequencias
      </Link>

      <PageHeader
        kicker={sequence.target_entity === "contact" ? "Sequencia de contato" : "Sequencia de negocio"}
        title={sequence.name}
        description={
          sequence.description ?? "Adicione passos com delays + canal + template/inline."
        }
        actions={
          <StatusBadge
            label={sequence.is_active ? "Ativa" : "Pausada"}
            tone={sequence.is_active ? "good" : "neutral"}
          />
        }
      />

      <WidgetCard kicker="Passos" title="Sequencia de execução">
        <SequenceStepsEditor
          sequenceId={sequence.id}
          steps={steps}
          emailTemplates={emailTemplates}
        />
      </WidgetCard>
    </div>
  );
}
