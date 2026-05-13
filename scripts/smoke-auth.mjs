// Authenticated navigation smoke test.
// Uses @supabase/ssr's exact cookie serialization, same as the browser client.
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = "http://127.0.0.1:54321";
const ANON = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
const APP = "http://localhost:3000";
const EMAIL = "lucas@demo.local";
const PASSWORD = "demodemo1234";

// Capture what @supabase/ssr actually writes to cookies when it sets a session
const cookieStore = new Map();
const capturedCookies = [];
const supabase = createServerClient(SUPABASE_URL, ANON, {
  cookies: {
    getAll() {
      return [...cookieStore.entries()].map(([name, value]) => ({ name, value }));
    },
    setAll(list) {
      for (const { name, value, options } of list) {
        cookieStore.set(name, value);
        capturedCookies.push({ name, value, options });
      }
    },
  },
});

const { error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (error) {
  console.error("login failed:", error.message);
  process.exit(1);
}

console.log(`Captured ${cookieStore.size} cookies from Supabase SSR:`);
for (const [name, value] of cookieStore.entries()) {
  console.log(`  ${name} (${value.length} chars)`);
}

// Build cookie header
const cookieHeader = [...cookieStore.entries()]
  .map(([name, value]) => `${name}=${value}`)
  .join("; ");

// Hit all protected routes
const routes = [
  "/dashboard",
  "/pipeline",
  "/contatos",
  "/atividades",
  "/metas",
  "/ligacoes",
  "/campanhas",
  "/campanhas/performance",
  "/campanhas/publicos",
  "/campanhas/criativos",
  "/campanhas/otimizador",
  "/campanhas/nova",
  "/campanhas/roadmap",
  "/marketing/landing-pages",
  "/marketing/formularios",
  "/marketing/emails",
  "/social",
  "/analytics",
  "/relatorios",
  "/analise",
  "/automacoes",
  "/prospeccao",
  "/prospeccao/sdr-ia",
  "/analise-calls",
  "/contratos",
  "/configuracoes",
  "/configuracoes/billing",
  "/configuracoes/billing/faturas",
  "/configuracoes/billing/uso",
  "/configuracoes/billing/pagamento",
  "/configuracoes/marca",
];

console.log("\nroute                                              status  kb");
let pass = 0, fail = 0;
for (const route of routes) {
  const res = await fetch(`${APP}${route}`, {
    headers: { cookie: cookieHeader },
    redirect: "manual",
  });
  const body = res.status === 200 ? await res.text() : "";
  const color = res.status === 200 ? "\x1b[32m" : res.status === 307 ? "\x1b[33m" : "\x1b[31m";
  console.log(
    `${route.padEnd(50)} ${color}${res.status}\x1b[0m   ${(body.length / 1024).toFixed(1)}`,
  );
  if (res.status === 200) pass++;
  else fail++;
}
console.log(`\npass=${pass} fail=${fail}`);
process.exit(fail === 0 ? 0 : 1);
