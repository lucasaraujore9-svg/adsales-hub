import { createServerClient } from "@supabase/ssr";
const cookieStore = new Map();
const sb = createServerClient("http://127.0.0.1:54321", "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH", {
  cookies: {
    getAll: () => [...cookieStore.entries()].map(([n,v])=>({name:n,value:v})),
    setAll: (l) => l.forEach(({name,value}) => cookieStore.set(name, value)),
  },
});
await sb.auth.signInWithPassword({ email:"lucas@demo.local", password:"demodemo1234" });
const cookie = [...cookieStore.entries()].map(([n,v])=>`${n}=${v}`).join("; ");

const routes = [
  "/configuracoes","/configuracoes/perfil","/configuracoes/empresa","/configuracoes/marca",
  "/configuracoes/usuarios","/configuracoes/billing","/configuracoes/campos","/configuracoes/importar",
  "/configuracoes/produtos","/configuracoes/motivos-perda","/configuracoes/duplicatas",
  "/configuracoes/sequencias","/configuracoes/email-templates","/configuracoes/whatsapp-templates",
  "/configuracoes/scripts-ligacao","/configuracoes/meta-ads","/configuracoes/pixel",
  "/configuracoes/ia-ciclo","/configuracoes/dominio","/configuracoes/social","/configuracoes/relatorios",
  "/configuracoes/ia","/configuracoes/sdr-ia","/configuracoes/contratos","/configuracoes/integracoes",
  "/configuracoes/whatsapp","/configuracoes/whatsapp-unofficial","/configuracoes/gmail",
  "/configuracoes/telefone","/configuracoes/calendario","/configuracoes/api","/configuracoes/webhooks",
];
let pass=0,fail=0;
for (const r of routes) {
  const res = await fetch(`http://localhost:3000${r}`, { headers:{cookie}, redirect:"manual" });
  const color = res.status===200 ? "\x1b[32m" : "\x1b[31m";
  console.log(`${r.padEnd(44)} ${color}${res.status}\x1b[0m`);
  if (res.status===200) pass++; else fail++;
}
console.log(`\npass=${pass} fail=${fail}`);
