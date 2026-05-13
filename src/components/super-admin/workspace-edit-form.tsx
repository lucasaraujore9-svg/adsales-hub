"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspace } from "@/lib/actions/super-admin";

interface Initial {
  name: string;
  slug: string;
  domain: string | null;
  timezone: string;
  locale: string;
}

interface Props {
  workspaceId: string;
  initial: Initial;
  readOnly?: boolean;
}

export function WorkspaceEditForm({ workspaceId, initial, readOnly }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<Initial>(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    start(async () => {
      const r = await updateWorkspace({
        workspace_id: workspaceId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        domain: form.domain?.trim() || null,
        timezone: form.timezone.trim(),
        locale: form.locale.trim(),
      });
      if (r.ok) {
        toast.success("Workspace atualizado.");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  const dirty =
    form.name !== initial.name ||
    form.slug !== initial.slug ||
    (form.domain ?? "") !== (initial.domain ?? "") ||
    form.timezone !== initial.timezone ||
    form.locale !== initial.locale;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="ws-name">Nome</Label>
        <Input
          id="ws-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="ws-slug">Slug</Label>
        <Input
          id="ws-slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          disabled={readOnly}
        />
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          a-z, 0-9 e hifens. Usado em URLs.
        </p>
      </div>
      <div>
        <Label htmlFor="ws-domain">Dominio customizado</Label>
        <Input
          id="ws-domain"
          value={form.domain ?? ""}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
          placeholder="adsaleshub.7iegroup.com.br"
          disabled={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="ws-timezone">Timezone</Label>
        <Input
          id="ws-timezone"
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          disabled={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="ws-locale">Locale</Label>
        <Input
          id="ws-locale"
          value={form.locale}
          onChange={(e) => setForm({ ...form, locale: e.target.value })}
          disabled={readOnly}
        />
      </div>
      <div className="md:col-span-2 flex justify-end gap-2">
        {readOnly ? (
          <span className="text-[11px] text-[color:var(--ink-4)]">
            Voce nao tem permissao para editar este workspace.
          </span>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!dirty || pending}
              onClick={() => setForm(initial)}
            >
              Reverter
            </Button>
            <Button type="submit" size="sm" disabled={!dirty || pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
