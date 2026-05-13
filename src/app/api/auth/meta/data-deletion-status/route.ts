import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    return new NextResponse(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Status de exclusao</title></head>` +
        `<body style="font-family:system-ui;max-width:560px;margin:60px auto;padding:0 20px;line-height:1.6">` +
        `<h1>Codigo invalido</h1><p>O codigo de confirmacao informado nao foi encontrado.</p>` +
        `</body></html>`,
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const sb = createAdminSupabaseClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            filter: (col: string, op: string, val: unknown) => {
              maybeSingle: () => Promise<{ data: unknown }>;
            };
          };
        };
      };
    };
  };
  const { data } = await sb
    .from("integration_events")
    .select("payload, received_at")
    .eq("provider", "meta")
    .eq("event_type", "delete_data_request")
    .filter("payload->>confirmation_code", "eq", id)
    .maybeSingle();

  if (!data) {
    return new NextResponse(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Status de exclusao</title></head>` +
        `<body style="font-family:system-ui;max-width:560px;margin:60px auto;padding:0 20px;line-height:1.6">` +
        `<h1>Codigo nao encontrado</h1><p>Verifique se o codigo foi copiado corretamente.</p>` +
        `</body></html>`,
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const payload = (data as { payload: { status?: string; meta_user_id?: string } }).payload ?? {};
  const receivedAt = (data as { received_at: string }).received_at;
  const status = payload.status ?? "pending";

  const statusLabel: Record<string, string> = {
    pending: "Em processamento",
    completed: "Concluida",
    failed: "Falhou",
  };

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Status da exclusao de dados · AdSales Hub</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: system-ui, sans-serif; max-width: 560px; margin: 60px auto; padding: 0 20px; line-height: 1.6; color: #1a1a1a; }
  h1 { font-size: 28px; margin-bottom: 8px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
  .card { border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; }
  .badge.pending { background: #fef3c7; color: #92400e; }
  .badge.completed { background: #d1fae5; color: #065f46; }
  .badge.failed { background: #fee2e2; color: #991b1b; }
  code { font-family: ui-monospace, monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  a { color: #0066cc; }
</style>
</head>
<body>
  <h1>Solicitacao de exclusao de dados</h1>
  <p class="meta">AdSales Hub · Compliance LGPD/GDPR/Meta Platform</p>

  <div class="card">
    <p>Status: <span class="badge ${status}">${statusLabel[status] ?? status}</span></p>
    <p><strong>Codigo de confirmacao:</strong><br><code>${id}</code></p>
    <p><strong>Solicitado em:</strong><br>${new Date(receivedAt).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}</p>
    <p><strong>Prazo:</strong> A exclusao completa de dados associados ocorre em ate 7 dias corridos.</p>
  </div>

  <p style="margin-top:24px;font-size:13px;color:#666">
    Duvidas? Envie um email para <a href="mailto:dpo@7iegroup.com.br">dpo@7iegroup.com.br</a> citando o codigo de confirmacao.
  </p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
