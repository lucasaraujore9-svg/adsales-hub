import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isValidRole } from "@/lib/auth/roles";
import { publicEnv } from "@/lib/env";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string().refine(isValidRole, "Invalid role"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await requireWorkspaceAdmin();

  const body = await request.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/accept-invite`,
      data: {
        workspace_id: session.workspaceId,
        role: parsed.data.role,
        name: parsed.data.name,
        invited_by: session.user.id,
      },
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, invited: data.user?.email });
}
