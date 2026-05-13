import { NextResponse } from "next/server";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";
import { createBillingPortalSession } from "@/lib/stripe/checkout";

export async function POST() {
  const session = await requireWorkspaceAdmin();

  try {
    const portal = await createBillingPortalSession(session.workspaceId);
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown_error" },
      { status: 400 },
    );
  }
}
