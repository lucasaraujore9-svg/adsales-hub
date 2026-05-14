"use server";

import { getSession } from "@/lib/auth/guards";

export type SearchResult = {
  contacts: Array<{ id: string; name: string; email: string | null; phone: string | null }>;
  deals: Array<{ id: string; title: string; status: string; value: number | null }>;
  companies: Array<{ id: string; name: string; website: string | null }>;
};

/**
 * Busca global do Cmd+K — usa a sessão autenticada do user (não API key).
 */
export async function searchGlobal(q: string): Promise<SearchResult> {
  const term = (q ?? "").trim().replace(/[%,]/g, "");
  if (term.length < 2) {
    return { contacts: [], deals: [], companies: [] };
  }

  const session = await getSession();
  const sb = session.supabase;
  const wid = session.workspaceId;
  const limit = 5;

  const [contactsRes, dealsRes, companiesRes] = await Promise.all([
    sb
      .from("contacts")
      .select("id, name, email, phone")
      .eq("workspace_id", wid)
      .or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
      .limit(limit),
    sb
      .from("deals")
      .select("id, title, status, value")
      .eq("workspace_id", wid)
      .ilike("title", `%${term}%`)
      .limit(limit),
    sb
      .from("companies")
      .select("id, name, website")
      .eq("workspace_id", wid)
      .ilike("name", `%${term}%`)
      .limit(limit),
  ]);

  return {
    contacts: (contactsRes.data ?? []) as SearchResult["contacts"],
    deals: (dealsRes.data ?? []) as SearchResult["deals"],
    companies: (companiesRes.data ?? []) as SearchResult["companies"],
  };
}
