"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setStaffRole } from "@/lib/actions/super-admin";

const ROLES = [
  { value: "", label: "—" },
  { value: "support", label: "Suporte" },
  { value: "customer_success", label: "Customer Success" },
  { value: "sales", label: "Vendas" },
  { value: "engineering", label: "Engenharia" },
  { value: "admin", label: "Admin" },
] as const;

interface Props {
  userId: string;
  currentRole: string | null;
  disabled?: boolean;
  isSelf?: boolean;
}

export function StaffRoleSelector({ userId, currentRole, disabled, isSelf }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleChange(value: string) {
    start(async () => {
      const r = await setStaffRole({
        user_id: userId,
        staff_role: value === "" ? null : value,
      });
      if (r.ok) {
        toast.success(value === "" ? "Cargo removido." : `Cargo alterado para ${value}.`);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  if (disabled && !isSelf) {
    return (
      <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[11px] uppercase text-[color:var(--ink-3)]">
        {currentRole ?? "—"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={pending || disabled}
        className="h-8 rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-2 text-xs"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {isSelf && (
        <span className="text-[10px] text-[color:var(--ink-4)]">voce</span>
      )}
    </div>
  );
}
