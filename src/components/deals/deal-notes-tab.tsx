"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createNote, deleteNote } from "@/lib/actions/notes";
import type { NoteRow, UserRow } from "@/lib/queries/crm";

function formatRelative(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "hoje";
  if (days < 7) return `${days}d atrás`;
  if (days < 30) return `${Math.round(days / 7)}sem atrás`;
  return `${Math.round(days / 30)}mes atrás`;
}

export function DealNotesTab({
  dealId,
  notes,
  users,
}: {
  dealId: string;
  notes: NoteRow[];
  users: UserRow[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, start] = useTransition();
  const userById = new Map(users.map((u) => [u.id, u]));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    start(async () => {
      const result = await createNote({ content: trimmed, deal_id: dealId });
      if (result.ok) {
        setContent("");
        toast.success("Nota adicionada");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir esta nota?")) return;
    start(async () => {
      const result = await deleteNote(id);
      if (result.ok) {
        toast.success("Nota excluida");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva uma nota..."
          rows={3}
          className="w-full resize-none rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm" disabled={pending || !content.trim()}>
            Adicionar nota
          </Button>
        </div>
      </form>

      <ul className="space-y-2">
        {notes.map((n) => {
          const author = n.user_id ? userById.get(n.user_id) : null;
          return (
            <li
              key={n.id}
              className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm text-[color:var(--ink-2)]">
                    {n.content}
                  </p>
                  <div className="mt-2 text-xs text-[color:var(--ink-4)]">
                    {author?.name ?? author?.email ?? "Usuario"} · {formatRelative(n.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={pending}
                  className="text-[color:var(--ink-4)] hover:text-[color:var(--bad)]"
                  aria-label="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
        {notes.length === 0 && (
          <li className="rounded-card border border-dashed border-[color:var(--line-2)] bg-[color:var(--panel)] p-8 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma nota ainda. Adicione uma acima.
          </li>
        )}
      </ul>
    </div>
  );
}
