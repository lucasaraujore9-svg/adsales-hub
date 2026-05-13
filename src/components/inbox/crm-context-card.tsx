"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  User as UserIcon,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import type { ConversationRow } from "@/lib/queries/inbox";
import type { ContactRow, DealRow, UserRow } from "@/lib/queries/crm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ownerColor, ownerInitials } from "@/components/inbox/conversation-card";
import { ConvertToDealDialog } from "@/components/inbox/convert-to-deal-dialog";
import { ResolveActivityDialog } from "@/components/inbox/resolve-activity-dialog";

interface Props {
  conversation: ConversationRow;
  contact: ContactRow | null;
  deal: DealRow | null;
  assignee: UserRow | undefined;
  users: UserRow[];
  onTogglePanel: () => void;
  panelOpen: boolean;
}

function formatCurrency(v: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

export function CRMContextCard({
  conversation,
  contact,
  deal,
  assignee,
  users,
  onTogglePanel,
  panelOpen,
}: Props) {
  const [convertOpen, setConvertOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  const displayName = contact?.name ?? conversation.channel_identifier;
  const lifecycle = contact?.lifecycle_stage ?? "lead";

  return (
    <div className="sticky top-0 z-10 border-b border-[color:var(--line)] bg-[color:var(--panel)]/95 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-4">
        {/* Contact avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
            style={{ backgroundColor: ownerColor(contact?.id ?? conversation.channel_identifier) }}
          >
            {contact?.name
              ? contact.name.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("")
              : <UserIcon className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-[color:var(--ink)]">
                {displayName}
              </span>
              <span className="rounded-pill bg-[color:var(--bg-2)] px-2 py-0.5 text-[10px] uppercase tracking-kicker text-[color:var(--ink-3)]">
                {lifecycle}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[color:var(--ink-4)]">
              {contact?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[180px]">{contact.email}</span>
                </span>
              )}
              {contact?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{contact.phone}</span>
                </span>
              )}
              {!contact && (
                <span className="flex items-center gap-1 text-[color:var(--warn)]">
                  <AlertTriangle className="h-3 w-3" /> Sem contato vinculado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Deal info or convert CTA */}
        <div className="ml-4 flex items-center gap-2">
          {deal ? (
            <Link
              href={`/negocios/${deal.id}`}
              className="group flex items-center gap-3 rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-2 transition-colors hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent)]/5"
            >
              <TrendingUp className="h-4 w-4 text-[color:var(--accent)]" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[color:var(--ink)]">
                  {deal.title}
                </span>
                <span className="text-[11px] text-[color:var(--ink-3)]">
                  {formatCurrency(deal.value, deal.currency)} ·{" "}
                  <span
                    className={cn(
                      deal.status === "won" && "text-[color:var(--good)]",
                      deal.status === "lost" && "text-[color:var(--bad)]",
                    )}
                  >
                    {deal.status === "open"
                      ? "Aberto"
                      : deal.status === "won"
                        ? "Ganho"
                        : "Perdido"}
                  </span>
                </span>
              </div>
              <ArrowUpRight className="h-3 w-3 text-[color:var(--ink-4)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]" />
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConvertOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Converter em negocio
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Assignee */}
          {assignee ? (
            <div className="flex items-center gap-1.5 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg-2)] px-2 py-1">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                style={{ backgroundColor: ownerColor(assignee.id) }}
              >
                {ownerInitials(assignee)}
              </div>
              <span className="text-[11px] font-medium text-[color:var(--ink-2)]">
                {assignee.name?.split(" ")[0] ?? "—"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-pill border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/10 px-2 py-1 text-[11px] text-[color:var(--warn)]">
              <AlertTriangle className="h-3 w-3" />
              Sem responsavel
            </div>
          )}

          {/* Quick actions */}
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={() => setResolveOpen(true)}
            disabled={conversation.status === "resolved"}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {conversation.status === "resolved" ? "Resolvida" : "Resolver"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePanel}
            aria-label={panelOpen ? "Ocultar painel" : "Mostrar painel"}
            className="gap-1"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                panelOpen && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>

      <ConvertToDealDialog
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        conversationId={conversation.id}
        defaultTitle={displayName ? `Oportunidade de ${displayName}` : "Nova oportunidade"}
      />
      <ResolveActivityDialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        conversationId={conversation.id}
        defaultActivity={`Follow-up: ${displayName}`}
      />

      {/* Expose users to allow inline assignee picker extension */}
      <span className="sr-only">{users.length} membros no workspace</span>
    </div>
  );
}
