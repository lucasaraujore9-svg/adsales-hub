"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createEmailCampaign } from "@/lib/actions/email-campaigns";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
}

const LIFECYCLES = [
  { key: "", label: "Todos" },
  { key: "lead", label: "Leads" },
  { key: "mql", label: "MQL" },
  { key: "sql", label: "SQL" },
  { key: "opportunity", label: "Oportunidades" },
  { key: "customer", label: "Clientes" },
];

export function EmailComposerButton({
  templates,
  defaultFromEmail,
  defaultFromName,
}: {
  templates: EmailTemplate[];
  defaultFromEmail: string;
  defaultFromName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [templateId, setTemplateId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduled, setScheduled] = useState(false);

  function applyTemplate(id: string) {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.subject);
      setContent(tpl.body_html);
    }
  }

  function handleSubmit(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      subject: subject || String(form.get("subject") ?? ""),
      preview_text: (form.get("preview_text") as string) || null,
      from_name: String(form.get("from_name") ?? defaultFromName),
      from_email: String(form.get("from_email") ?? defaultFromEmail),
      reply_to: (form.get("reply_to") as string) || null,
      template_id: templateId || null,
      content: content || String(form.get("content") ?? ""),
      segment_lifecycle: (form.get("segment_lifecycle") as string) || null,
      segment_source: (form.get("segment_source") as string) || null,
      scheduled_at: scheduled ? (form.get("scheduled_at") as string) : null,
    };
    start(async () => {
      const result = await createEmailCampaign(body);
      if (result.ok) {
        toast.success(scheduled ? "Campanha agendada" : "Rascunho criado");
        setOpen(false);
        setTemplateId("");
        setSubject("");
        setContent("");
        setScheduled(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Nova campanha
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova campanha de email</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="ec-name">Nome interno</Label>
              <Input
                id="ec-name"
                name="name"
                required
                autoFocus
                placeholder="Black Friday 2026"
              />
            </div>
            <div>
              <Label htmlFor="ec-template">Template (opcional)</Label>
              <select
                id="ec-template"
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">(Sem template)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="ec-subject">Assunto</Label>
            <Input
              id="ec-subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Acabou de chegar pra voce, {{contact_name}}"
            />
          </div>
          <div>
            <Label htmlFor="ec-preview">Preview text (opcional)</Label>
            <Input
              id="ec-preview"
              name="preview_text"
              maxLength={150}
              placeholder="Aparece no preview do inbox antes do usuario abrir"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="ec-from-name">From name</Label>
              <Input id="ec-from-name" name="from_name" defaultValue={defaultFromName} required />
            </div>
            <div>
              <Label htmlFor="ec-from-email">From email</Label>
              <Input
                id="ec-from-email"
                name="from_email"
                type="email"
                defaultValue={defaultFromEmail}
                required
              />
            </div>
            <div>
              <Label htmlFor="ec-reply">Reply-to</Label>
              <Input id="ec-reply" name="reply_to" type="email" />
            </div>
          </div>
          <div>
            <Label htmlFor="ec-content">Corpo HTML</Label>
            <textarea
              id="ec-content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 font-mono text-xs"
              placeholder="<p>Olá {{contact_name}},</p>"
            />
          </div>

          <fieldset className="space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
            <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
              Segmentacao (opcional)
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ec-life">Lifecycle</Label>
                <select
                  id="ec-life"
                  name="segment_lifecycle"
                  className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-xs"
                >
                  {LIFECYCLES.map((l) => (
                    <option key={l.key} value={l.key}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="ec-src">Origem</Label>
                <Input
                  id="ec-src"
                  name="segment_source"
                  placeholder="meta_ads, organic, ..."
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-3">
            <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
              Envio
            </legend>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ec-sched-toggle"
                checked={scheduled}
                onChange={(e) => setScheduled(e.target.checked)}
              />
              <Label htmlFor="ec-sched-toggle" className="!mt-0">
                Agendar envio
              </Label>
            </div>
            {scheduled && (
              <div>
                <Label htmlFor="ec-sched">Quando</Label>
                <Input
                  id="ec-sched"
                  name="scheduled_at"
                  type="datetime-local"
                  required={scheduled}
                />
              </div>
            )}
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Salvando..." : scheduled ? "Agendar" : "Salvar rascunho"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
