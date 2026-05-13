// Server-side smoke test: runs every query used by authenticated pages with
// the service role key, verifies they don't throw and data is present.
import { createClient } from "@supabase/supabase-js";

const WORKSPACE = "99999999-9999-4999-8999-100000000001";
const supabase = createClient(
  "http://127.0.0.1:54321",
  "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function run(label, fn) {
  try {
    const t0 = Date.now();
    const data = await fn();
    const elapsed = Date.now() - t0;
    const summary = Array.isArray(data)
      ? `${data.length} rows`
      : data == null
        ? "null"
        : typeof data === "object" && data !== null
          ? Object.keys(data).length + " keys"
          : String(data);
    console.log(`\x1b[32m✓\x1b[0m ${label.padEnd(45)} ${summary} (${elapsed}ms)`);
    return true;
  } catch (err) {
    console.log(`\x1b[31m✗\x1b[0m ${label.padEnd(45)} ${err.message}`);
    return false;
  }
}

let passed = 0, total = 0;
async function check(...args) {
  total++;
  if (await run(...args)) passed++;
}

console.log("=== CRM (deals/contacts/activities/pipelines) ===");
await check("deals list", async () => {
  const { data, error } = await supabase.from("deals")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("contacts list", async () => {
  const { data, error } = await supabase.from("contacts")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("activities list", async () => {
  const { data, error } = await supabase.from("activities")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("pipelines + stages", async () => {
  const [{ data: p }, { data: s }] = await Promise.all([
    supabase.from("pipelines").select("*").eq("workspace_id", WORKSPACE),
    supabase.from("pipeline_stages").select("*"),
  ]);
  return { pipelines: p?.length, stages: s?.length };
});
await check("companies list", async () => {
  const { data, error } = await supabase.from("companies")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});

console.log("\n=== Marketing (campaigns/adsets/ads/metrics) ===");
await check("campaigns", async () => {
  const { data, error } = await supabase.from("campaigns")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("ad_sets", async () => {
  const { data, error } = await supabase.from("ad_sets")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("ads", async () => {
  const { data, error } = await supabase.from("ads")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("campaign_metrics 14d", async () => {
  const since = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
  const { data, error } = await supabase.from("campaign_metrics")
    .select("*").gte("date", since);
  if (error) throw error;
  return data;
});
await check("audiences", async () => {
  const { data, error } = await supabase.from("audiences")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("ad_creatives", async () => {
  const { data, error } = await supabase.from("ad_creatives")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("ai_optimization_logs", async () => {
  const { data, error } = await supabase.from("ai_optimization_logs")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});

console.log("\n=== Content (LPs/forms/emails/social) ===");
await check("landing_pages", async () => {
  const { data, error } = await supabase.from("landing_pages")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("forms", async () => {
  const { data, error } = await supabase.from("forms")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("form_submissions", async () => {
  const { data, error } = await supabase.from("form_submissions")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("email_campaigns", async () => {
  const { data, error } = await supabase.from("email_campaigns")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("email_campaign_metrics", async () => {
  const { data, error } = await supabase.from("email_campaign_metrics")
    .select("*");
  if (error) throw error;
  return data;
});
await check("social_accounts", async () => {
  const { data, error } = await supabase.from("social_accounts")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("social_posts", async () => {
  const { data, error } = await supabase.from("social_posts")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});

console.log("\n=== Analytics / IA ===");
await check("ai_insights", async () => {
  const { data, error } = await supabase.from("ai_insights")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("ai_questions", async () => {
  const { data, error } = await supabase.from("ai_questions")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("reports", async () => {
  const { data, error } = await supabase.from("reports")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("report_templates", async () => {
  const { data, error } = await supabase.from("report_templates")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});

console.log("\n=== Billing + Usage ===");
await check("subscriptions", async () => {
  const { data, error } = await supabase.from("subscriptions")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("invoices", async () => {
  const { data, error } = await supabase.from("invoices")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("usage_records", async () => {
  const { data, error } = await supabase.from("usage_records")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("workspace_branding", async () => {
  const { data, error } = await supabase.from("workspace_branding")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("workspace_modules", async () => {
  const { data, error } = await supabase.from("workspace_modules")
    .select("*, modules(slug)").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});

console.log("\n=== Expansion (SDR + contratos) ===");
await check("sdr_configs", async () => {
  const { data, error } = await supabase.from("sdr_configs")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("sdr_calls", async () => {
  const { data, error } = await supabase.from("sdr_calls")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("proposals", async () => {
  const { data, error } = await supabase.from("proposals")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});
await check("contracts", async () => {
  const { data, error } = await supabase.from("contracts")
    .select("*").eq("workspace_id", WORKSPACE);
  if (error) throw error;
  return data;
});

console.log("\n=== RPC functions ===");
await check("check_plan_limit", async () => {
  const { data, error } = await supabase.rpc("check_plan_limit", {
    p_workspace_id: WORKSPACE,
    p_resource: "users",
  });
  if (error) throw error;
  return data;
});
await check("get_workspace_enabled_modules", async () => {
  const { data, error } = await supabase.rpc("get_workspace_enabled_modules", {
    p_workspace_id: WORKSPACE,
  });
  if (error) throw error;
  return data;
});

console.log(`\n\x1b[1m${passed}/${total} queries OK\x1b[0m`);
process.exit(passed === total ? 0 : 1);
