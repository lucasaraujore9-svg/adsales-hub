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

const routes = ["/inbox"];
for (const r of routes) {
  const res = await fetch(`http://localhost:3000${r}`, { headers: { cookie }, redirect: "manual" });
  // For /inbox we expect a redirect to /inbox/<first conversation id>
  console.log(`${r} → ${res.status}${res.status===307?' → '+res.headers.get("location"):''}`);
  if (res.status === 307) {
    const next = res.headers.get("location");
    const res2 = await fetch(`http://localhost:3000${next}`, { headers: { cookie }, redirect: "manual" });
    const body = res2.status === 200 ? await res2.text() : "";
    console.log(`  ${next} → ${res2.status} (${(body.length/1024).toFixed(1)}kb)`);
  }
}
