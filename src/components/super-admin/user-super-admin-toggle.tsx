"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleSuperAdmin } from "@/lib/actions/super-admin";

interface Props {
  userId: string;
  isSuperAdmin: boolean;
  isSelf: boolean;
}

export function UserSuperAdminToggle({ userId, isSuperAdmin, isSelf }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      const r = await toggleSuperAdmin({
        user_id: userId,
        is_super_admin: !isSuperAdmin,
      });
      if (r.ok) {
        toast.success(isSuperAdmin ? "Removido como super admin." : "Promovido a super admin.");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  if (isSelf) {
    return (
      <span className="rounded-pill border border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 px-2 py-0.5 text-[11px] font-medium text-[color:var(--bad)]">
        voce ✓
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant={isSuperAdmin ? "default" : "outline"}
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "..." : isSuperAdmin ? "ativo ✓" : "promover"}
    </Button>
  );
}
