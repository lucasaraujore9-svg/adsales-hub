import { ownerById, OWNERS } from "@/lib/mock/crm";
import { cn } from "@/lib/utils";

interface Props {
  ownerIds?: string[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function AvatarStack({ ownerIds, max = 3, size = "sm" }: Props) {
  const ids = (ownerIds && ownerIds.length > 0 ? ownerIds : OWNERS.slice(0, 3).map((o) => o.id)).slice(0, max);
  const extra = (ownerIds?.length ?? 0) - max;
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : size === "md" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[13px]";
  return (
    <div className="flex -space-x-2">
      {ids.map((id) => {
        const o = ownerById(id);
        return (
          <div
            key={id}
            className={cn(
              "flex items-center justify-center rounded-full border-2 border-[color:var(--panel)] font-medium text-white",
              dim,
            )}
            style={{ backgroundColor: o.color }}
            title={o.name}
          >
            {o.avatar}
          </div>
        );
      })}
      {extra > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-[color:var(--panel)] bg-[color:var(--bg-2)] font-medium text-[color:var(--ink-3)]",
            dim,
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

export function Avatar({ ownerId, size = "sm" }: { ownerId: string; size?: "sm" | "md" | "lg" }) {
  const o = ownerById(ownerId);
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : size === "md" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[13px]";
  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-medium text-white", dim)}
      style={{ backgroundColor: o.color }}
      title={o.name}
    >
      {o.avatar}
    </div>
  );
}
