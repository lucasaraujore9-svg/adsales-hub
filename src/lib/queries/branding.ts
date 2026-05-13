import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface WorkspaceBranding {
  accent_color: string;
  accent_color_light: string | null;
  logo_url: string | null;
  logo_icon_url: string | null;
  secondary_color: string | null;
  favicon_url: string | null;
}

export async function getBranding(
  supabase: SB,
  workspaceId: string,
): Promise<WorkspaceBranding> {
  const { data } = await supabase
    .from("workspace_branding")
    .select("accent_color, accent_color_light, logo_url, logo_icon_url, secondary_color, favicon_url")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  const row = (data as unknown as WorkspaceBranding | null) ?? null;
  return {
    accent_color: row?.accent_color ?? "#FF5E1A",
    accent_color_light: row?.accent_color_light ?? null,
    logo_url: row?.logo_url ?? null,
    logo_icon_url: row?.logo_icon_url ?? null,
    secondary_color: row?.secondary_color ?? null,
    favicon_url: row?.favicon_url ?? null,
  };
}
