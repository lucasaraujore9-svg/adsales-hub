import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { ProposalBlocksEditor } from "@/components/settings/proposal-blocks-editor";

export const metadata = { title: "Editar template proposta · AdSales Hub" };

interface ProposalTemplateRow {
  id: string;
  name: string;
  description: string | null;
  blocks: unknown;
  default_validity_days: number;
  is_active: boolean;
}

interface Block {
  type:
    | "cover"
    | "problem"
    | "solution"
    | "products"
    | "pricing"
    | "terms"
    | "testimonials"
    | "cta"
    | "custom";
  title: string;
  content?: string | null;
  config?: Record<string, unknown>;
}

export default async function ProposalTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const { data } = await session.supabase
    .from("proposal_templates")
    .select("id, name, description, blocks, default_validity_days, is_active")
    .eq("id", id)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  const tpl = data as ProposalTemplateRow | null;
  if (!tpl) notFound();

  const rawBlocks = Array.isArray(tpl.blocks) ? (tpl.blocks as unknown[]) : [];
  const blocks: Block[] = rawBlocks
    .filter((b): b is Record<string, unknown> => typeof b === "object" && b !== null)
    .map((b) => ({
      type: (b.type as Block["type"]) ?? "custom",
      title: String(b.title ?? "Sem titulo"),
      content: typeof b.content === "string" ? b.content : null,
      config:
        typeof b.config === "object" && b.config !== null
          ? (b.config as Record<string, unknown>)
          : undefined,
    }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes/contratos"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Templates
      </Link>

      <PageHeader
        kicker="Bloco F · Template proposta"
        title={tpl.name}
        description={tpl.description ?? "Estrutura reutilizavel para gerar propostas rapidamente."}
        actions={
          <StatusBadge
            label={tpl.is_active ? "Ativo" : "Inativo"}
            tone={tpl.is_active ? "good" : "neutral"}
          />
        }
      />

      <WidgetCard kicker="Blocos" title="Estrutura da proposta">
        <ProposalBlocksEditor
          templateId={tpl.id}
          initialBlocks={blocks}
          initialValidityDays={tpl.default_validity_days}
        />
      </WidgetCard>
    </div>
  );
}
