import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getRequestMeta } from "@/lib/server/request-meta";
import { recordContractEvent } from "@/lib/contracts/audit";

interface SignatoryRow {
  id: string;
  contract_id: string;
  name: string;
  email: string;
  sign_order: number;
  status: string;
}

interface ContractRow {
  id: string;
  workspace_id: string;
  status: string;
  expires_at: string | null;
  content: string;
  deal_id: string | null;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const sb = createAdminSupabaseClient();

  let body: {
    action?: string;
    signature_type?: "draw" | "type";
    signature_data?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const action = body.action ?? "sign";

  const { data: sigData } = await sb
    .from("contract_signatories")
    .select("id, contract_id, name, email, sign_order, status")
    .eq("id", token)
    .maybeSingle();
  const signatory = sigData as SignatoryRow | null;
  if (!signatory) {
    return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 404 });
  }

  if (signatory.status === "signed" || signatory.status === "declined") {
    return NextResponse.json(
      { ok: false, error: `Ja ${signatory.status}` },
      { status: 400 },
    );
  }

  const { data: contractData } = await sb
    .from("contracts")
    .select("id, workspace_id, status, expires_at, content, deal_id")
    .eq("id", signatory.contract_id)
    .maybeSingle();
  const contract = contractData as ContractRow | null;
  if (!contract) {
    return NextResponse.json({ ok: false, error: "Contrato não encontrado" }, { status: 404 });
  }

  if (contract.status === "canceled" || contract.status === "signed") {
    return NextResponse.json(
      { ok: false, error: `Contrato ${contract.status}` },
      { status: 400 },
    );
  }

  if (contract.expires_at && new Date(contract.expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: "Contrato expirado" }, { status: 400 });
  }

  // Verify ordem
  if (action === "sign") {
    const { data: prevs } = await sb
      .from("contract_signatories")
      .select("status, sign_order")
      .eq("contract_id", contract.id)
      .lt("sign_order", signatory.sign_order);
    const allPrevSigned = (
      (prevs ?? []) as { status: string; sign_order: number }[]
    ).every((p) => p.status === "signed");
    if (!allPrevSigned) {
      return NextResponse.json(
        { ok: false, error: "Aguarde signatarios anteriores" },
        { status: 400 },
      );
    }
  }

  const now = new Date().toISOString();
  const meta = await getRequestMeta();
  const ip = meta.ip;
  const userAgent = meta.userAgent;
  const geo = meta.geo;

  if (action === "decline") {
    const { error } = await sb
      .from("contract_signatories")
      .update({
        status: "declined",
        declined_at: now,
        ip_address: ip,
        user_agent: userAgent,
        geolocation: geo,
      } as never)
      .eq("id", signatory.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    await sb
      .from("contracts")
      .update({ status: "canceled" } as never)
      .eq("id", contract.id);

    await recordContractEvent(sb, {
      contractId: contract.id,
      workspaceId: contract.workspace_id,
      eventType: "declined",
      signatoryId: signatory.id,
      ip,
      userAgent,
      geolocation: geo,
    });

    return NextResponse.json({ ok: true });
  }

  // sign
  const sigType = body.signature_type;
  const sigData2 = body.signature_data;
  if (!sigType || !sigData2) {
    return NextResponse.json(
      { ok: false, error: "Assinatura ausente" },
      { status: 400 },
    );
  }

  const { error } = await sb
    .from("contract_signatories")
    .update({
      status: "signed",
      signed_at: now,
      signature_type: sigType,
      signature_data: sigData2,
      ip_address: ip,
      user_agent: userAgent,
      geolocation: geo,
    } as never)
    .eq("id", signatory.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  await recordContractEvent(sb, {
    contractId: contract.id,
    workspaceId: contract.workspace_id,
    eventType: "signed",
    signatoryId: signatory.id,
    ip,
    userAgent,
    geolocation: geo,
    metadata: { signature_type: sigType },
  });

  // Check se todos assinaram
  const { data: allSigsRaw } = await sb
    .from("contract_signatories")
    .select("status")
    .eq("contract_id", contract.id);
  const allSigs = (allSigsRaw ?? []) as { status: string }[];
  const allSigned = allSigs.length > 0 && allSigs.every((s) => s.status === "signed");
  const anyPartial = allSigs.some((s) => s.status === "signed") && !allSigned;

  if (allSigned) {
    // Hash de auditoria
    const hash = createHash("sha256")
      .update(
        contract.content +
          allSigs.map(() => "").join("") +
          contract.id +
          now,
      )
      .digest("hex");

    await sb
      .from("contracts")
      .update({
        status: "signed",
        signed_at: now,
        verification_hash: hash,
      } as never)
      .eq("id", contract.id);

    await recordContractEvent(sb, {
      contractId: contract.id,
      workspaceId: contract.workspace_id,
      eventType: "fully_signed",
      metadata: { hash, signers_count: allSigs.length },
    });

    // Auto-progride deal vinculado ao contrato (issue 062)
    if (contract.deal_id) {
      const { data: dealRow } = await sb
        .from("deals")
        .select("id, pipeline_id, status, workspace_id")
        .eq("id", contract.deal_id)
        .maybeSingle();
      const deal = dealRow as
        | { id: string; pipeline_id: string; status: string; workspace_id: string }
        | null;

      if (deal && deal.status !== "won") {
        // Estágio "ganho" do pipeline do próprio deal (não de outro)
        const { data: wonStage } = await sb
          .from("pipeline_stages")
          .select("id")
          .eq("pipeline_id", deal.pipeline_id)
          .eq("is_won", true)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle();
        const wonStageId = (wonStage as { id?: string } | null)?.id;

        const dealUpdate: Record<string, unknown> = {
          status: "won",
          closed_at: now,
          stage_entered_at: now,
        };
        if (wonStageId) dealUpdate.stage_id = wonStageId;

        await sb.from("deals").update(dealUpdate as never).eq("id", deal.id);

        // Webhook deal.won (async, non-blocking)
        void (async () => {
          try {
            const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
            await dispatchWebhook(deal.workspace_id, "deal.won", {
              deal_id: deal.id,
              won_via_contract: contract.id,
            });
          } catch (e) {
            console.error("[contract/sign] failed to dispatch deal.won", e);
          }
        })();
      }
    }
  } else if (anyPartial) {
    await sb
      .from("contracts")
      .update({ status: "partially_signed" } as never)
      .eq("id", contract.id);
  }

  return NextResponse.json({ ok: true, allSigned });
}
