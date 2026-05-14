# 008 — Rate limit em login/signup/forgot-password

**Tipo:** compliance / fix
**Severidade:** alto
**Bloco:** Infra (segurança)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Endpoints de autenticação ([src/lib/auth/actions.ts](../src/lib/auth/actions.ts)) não têm rate limit. Atacante:

- Brute force de senhas
- Cria 1000s de signups falsos (esgota recursos, polui banco)
- Spam em forgot-password com emails de outras pessoas

## Critérios de aceite

- [ ] Login: max 5 tentativas por email + 10 por IP em 15 min
- [ ] Signup: max 3 por IP em 15 min
- [ ] Forgot password: max 3 por email em 1h
- [ ] Resposta clara: "Muitas tentativas. Tente novamente em X min."
- [ ] Não vaza informação sobre existência de email
- [ ] Funciona sem dependência externa cara (in-memory ou simples Postgres)
- [ ] Configurável via env

## Plan

**Decisão:** sem Redis ainda (custo extra). Usar **rate limit em-memória + persistência leve em Postgres** para casos críticos.

1. Criar `src/lib/rate-limit.ts`:
   ```ts
   type Entry = { count: number; resetAt: number };
   const buckets = new Map<string, Entry>();
   
   export function checkRateLimit(
     key: string,
     limit: number,
     windowMs: number
   ): { ok: boolean; remaining: number; resetIn: number } {
     const now = Date.now();
     const entry = buckets.get(key);
     if (!entry || entry.resetAt < now) {
       buckets.set(key, { count: 1, resetAt: now + windowMs });
       return { ok: true, remaining: limit - 1, resetIn: windowMs };
     }
     entry.count += 1;
     const remaining = Math.max(0, limit - entry.count);
     const resetIn = entry.resetAt - now;
     return { ok: entry.count <= limit, remaining, resetIn };
   }
   
   // Cleanup periódico (evita memory leak)
   setInterval(() => {
     const now = Date.now();
     for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
   }, 60_000).unref?.();
   ```

2. Em [src/lib/auth/actions.ts](../src/lib/auth/actions.ts):
   ```ts
   import { checkRateLimit } from '@/lib/rate-limit';
   import { headers } from 'next/headers';
   
   export async function loginWithPassword(_prev, formData) {
     const email = String(formData.get('email') ?? '').toLowerCase();
     const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
     
     const byEmail = checkRateLimit(`login:email:${email}`, 5, 15 * 60_000);
     const byIp = checkRateLimit(`login:ip:${ip}`, 10, 15 * 60_000);
     if (!byEmail.ok || !byIp.ok) {
       const min = Math.ceil(Math.max(byEmail.resetIn, byIp.resetIn) / 60_000);
       return { ok: false, error: `Muitas tentativas. Tente novamente em ${min} min.` };
     }
     // ... resto
   }
   ```

3. Mesma proteção em `signupWithPassword` (limite 3 por IP, 15 min) e `requestPasswordReset` (limite 3 por email, 1h).

4. Em ambiente serverless (Vercel), o `Map` reseta a cada cold start. Aceitável para MVP — um atacante que persiste vai conseguir alguma rajada extra, mas o fluxo médio fica protegido. Adicionar TODO para migrar para Upstash Redis em próxima fase.

5. Adicionar variável opcional `RATE_LIMIT_DISABLED=1` para desabilitar em dev local se necessário.

## Arquivos afetados

- `src/lib/rate-limit.ts` (novo)
- `src/lib/auth/actions.ts` (3 funções)

## Como testar

1. Rodar `npm run dev`
2. No browser, errar senha 6 vezes seguidas
3. 6ª tentativa: vê mensagem "Muitas tentativas. Tente novamente em 15 min."
4. Aguardar (ou ajustar `windowMs` para 30s no teste) → permite de novo
5. Tentar via curl rapidamente:
   ```bash
   for i in {1..15}; do
     curl -X POST http://localhost:3000/api/auth/login \
       -d "email=test@x.com&password=wrong" -w "%{http_code}\n" -o /dev/null -s
   done
   ```
   → primeiras 5 retornam erro de credencial; depois retornam erro de rate limit

## Notas

- Não usar IP como única chave (NAT compartilha IPs)
- Combinar email + IP é mais robusto
- Em produção real, migrar para Upstash Redis ou Postgres com expiração
- Considerar captcha após 3 falhas (próxima fase)
