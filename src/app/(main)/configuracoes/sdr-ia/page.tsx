import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { SdrConfigForm } from "@/components/settings/sdr-config-form";

export const metadata = { title: "SDR + Agente de Voz IA · AdSales Hub" };

interface SdrConfigRow {
  is_active: boolean;
  phone_number: string | null;
  tone: "formal" | "casual" | "technical";
  language: "pt-BR" | "en" | "es";
  max_attempts: number;
  qualification_script: { questions?: string[] } | null;
  working_hours: { start?: string; end?: string } | null;
}

export default async function SdrConfigPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("sdr_configs")
    .select(
      "is_active, phone_number, tone, language, max_attempts, qualification_script, working_hours",
    )
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();

  const cfg = (data ?? null) as SdrConfigRow | null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Bloco E"
        title="SDR + Agente de Voz IA"
        description="Quem o agente vai chamar, quando e o que perguntar. A IA roda dentro destes limites."
      />

      <WidgetCard kicker="Configuracao do agente" title="Roteiro, voz, horarios">
        <SdrConfigForm
          config={{
            is_active: cfg?.is_active ?? false,
            phone_number: cfg?.phone_number ?? null,
            tone: cfg?.tone ?? "formal",
            language: cfg?.language ?? "pt-BR",
            max_attempts: cfg?.max_attempts ?? 3,
            qualification_questions: cfg?.qualification_script?.questions ?? [],
            working_hours_start: cfg?.working_hours?.start ?? "09:00",
            working_hours_end: cfg?.working_hours?.end ?? "18:00",
          }}
        />
      </WidgetCard>
    </div>
  );
}
