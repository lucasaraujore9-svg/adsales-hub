"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";

interface Props {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export function UserMenu({ name, email, avatarUrl }: Props) {
  const [pending, start] = useTransition();
  const initials = (name ?? email)
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] p-0.5 pr-3 transition-colors hover:border-[color:var(--line-2)]"
        >
          <Avatar className="h-7 w-7">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? email} />}
            <AvatarFallback className="bg-[color:var(--accent)]/20 text-xs text-[color:var(--accent)]">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate text-xs font-medium md:inline">
            {name ?? email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium">{name ?? email}</span>
          <span className="text-xs text-[color:var(--ink-3)]">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/configuracoes/perfil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" /> Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Configuracoes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes/billing" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" /> Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            start(() => signOut());
          }}
          className="cursor-pointer text-[color:var(--bad)] focus:text-[color:var(--bad)]"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
