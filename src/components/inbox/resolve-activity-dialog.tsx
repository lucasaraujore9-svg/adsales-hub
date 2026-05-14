"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { resolveAndMaybeCreateActivity } from "@/lib/actions/inbox-ops";

interface Props {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  defaultActivity: string;
}

export function ResolveActivityDialog({
  open,
  onClose,
  conversationId,
  defaultActivity,
}: Props) {
  const [createActivity, setCreateActivity] = useState(true);
  const [activityTitle, setActivityTitle] = useState(defaultActivity);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    const fd = new FormData();
    fd.set("conversation_id", conversationId);
    if (createActivity) {
      fd.set("create_activity", "1");
      fd.set("activity_title", activityTitle);
    }
    start(async () => {
      try {
        await resolveAndMaybeCreateActivity(fd);
        toast.success(
          createActivity ? "Resolvida + atividade agendada" : "Conversa resolvida",
        );
        router.refresh();
        onClose();
      } catch {
        toast.error("Nao foi possível resolver");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[color:var(--panel)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--good)]" />
            Resolver conversa
          </DialogTitle>
          <DialogDescription>
            Opcionalmente, crie uma atividade de follow-up para retomar esse lead depois.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <label className="flex items-start gap-2 rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3 cursor-pointer">
            <Checkbox
              checked={createActivity}
              onCheckedChange={(v) => setCreateActivity(Boolean(v))}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">Agendar follow-up em 2 dias</div>
              <p className="text-[11px] text-[color:var(--ink-3)]">
                Cria uma tarefa pra voce/time nao esquecer do lead.
              </p>
            </div>
          </label>

          {createActivity && (
            <div className="grid gap-1.5">
              <Label htmlFor="activity-title">Titulo da atividade</Label>
              <Input
                id="activity-title"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Resolvendo..." : "Resolver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
