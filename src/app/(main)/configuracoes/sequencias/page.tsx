import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { SequencesManager } from "@/components/settings/sequences-manager";

export const metadata = { title: "Sequencias · AdSales Hub" };

interface SequenceRow {
  id: string;
  name: string;
  description: string | null;
  target_entity: string;
  is_active: boolean;
}

export default async function SequencesPage() {
  const session = await getSession();
  const sb = session.supabase;
  const [{ data: seqRaw }, { data: stepsRaw }] = await Promise.all([
    sb
      .from("sequences")
      .select("id, name, description, target_entity, is_active")
      .eq("workspace_id", session.workspaceId)
      .order("updated_at", { ascending: false }),
    sb.from("sequence_steps").select("sequence_id"),
  ]);
  const sequences = (seqRaw ?? []) as unknown as SequenceRow[];
  const stepsCountBySeq = new Map<string, number>();
  for (const s of (stepsRaw ?? []) as { sequence_id: string }[]) {
    stepsCountBySeq.set(s.sequence_id, (stepsCountBySeq.get(s.sequence_id) ?? 0) + 1);
  }
  const enriched = sequences.map((s) => ({
    ...s,
    steps_count: stepsCountBySeq.get(s.id) ?? 0,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Comunicacao"
        title="Sequencias"
        description="Cadencias multi-canal (email + WhatsApp + tarefa) que rodam automaticamente. Crie a sequencia aqui; passos sao adicionados via builder (em construcao)."
      />

      <SequencesManager sequences={enriched} />
    </div>
  );
}
