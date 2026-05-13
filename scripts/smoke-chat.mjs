// Streaming chat smoke test. Sends a message, reads NDJSON chunks, prints output.
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = "http://127.0.0.1:54321";
const ANON = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
const APP = "http://localhost:3000";
const EMAIL = "lucas@demo.local";
const PASSWORD = "demodemo1234";

const cookieStore = new Map();
const supabase = createServerClient(SUPABASE_URL, ANON, {
  cookies: {
    getAll: () => [...cookieStore.entries()].map(([name, value]) => ({ name, value })),
    setAll: (list) => list.forEach(({ name, value }) => cookieStore.set(name, value)),
  },
});

const { error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (error) {
  console.error("login failed", error.message);
  process.exit(1);
}

const cookie = [...cookieStore.entries()].map(([n, v]) => `${n}=${v}`).join("; ");

const res = await fetch(`${APP}/api/ai/chat`, {
  method: "POST",
  headers: { "content-type": "application/json", cookie },
  body: JSON.stringify({ message: "Quantas campanhas ativas eu tenho e qual o ROAS medio?" }),
});

if (!res.ok) {
  console.error("HTTP", res.status, await res.text());
  process.exit(1);
}

console.log("x-thread-id:", res.headers.get("x-thread-id"));
console.log("---stream---");

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";
let totalText = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.trim()) continue;
    const event = JSON.parse(line);
    if (event.type === "delta") {
      totalText += event.text;
      process.stdout.write(event.text);
    } else if (event.type === "thread_id") {
      console.log(`[thread created: ${event.thread_id}]`);
    } else if (event.type === "done") {
      console.log("\n---done---");
    } else if (event.type === "error") {
      console.log(`\n[error: ${event.message}]`);
    }
  }
}

console.log(`\ntotal tokens streamed: ${totalText.length} chars`);
