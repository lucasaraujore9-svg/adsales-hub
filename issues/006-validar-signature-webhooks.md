# 006 — Validar signature em webhooks (Meta, WhatsApp, Resend)

**Tipo:** compliance / fix
**Severidade:** crítico
**Bloco:** Infra (segurança)
**Dependências:** nenhuma
**Esforço estimado:** M (8-12h)
**Status:** todo

## Contexto

Webhooks aceitam POST com payload JSON sem validar assinatura. Atacante consegue:

- Injetar leads/mensagens fake (Meta Leads, WhatsApp)
- Forjar status de email enviado (Resend)
- Manipular dados pessoais que entram no CRM

Arquivos afetados:
- [src/app/api/webhooks/meta-leads/route.ts](../src/app/api/webhooks/meta-leads/route.ts)
- [src/app/api/webhooks/meta-messaging/route.ts](../src/app/api/webhooks/meta-messaging/route.ts)
- [src/app/api/webhooks/whatsapp/route.ts](../src/app/api/webhooks/whatsapp/route.ts)
- [src/app/api/webhooks/resend/route.ts](../src/app/api/webhooks/resend/route.ts)

Stripe e voice-engine já têm verificação parcial.

## Critérios de aceite

- [ ] Meta webhooks validam `X-Hub-Signature-256` com `META_APP_SECRET`
- [ ] WhatsApp webhook valida mesma signature (Meta)
- [ ] Resend webhook valida `svix-signature` via lib `svix`
- [ ] Em produção: requisição sem signature válida → 403
- [ ] Em dev (sem secret configurado): aceita com warning no log
- [ ] Função utilitária reutilizável `verifyMetaSignature(body, sig, secret)`
- [ ] Logs claros quando signature falha (sem expor secret)
- [ ] Testes manuais com curl confirmam rejeição

## Plan

1. Criar `src/lib/webhooks/verify.ts`:
   ```ts
   import { createHmac, timingSafeEqual } from 'node:crypto';
   
   export function verifyMetaSignature(
     rawBody: string,
     headerValue: string | null,
     secret: string
   ): boolean {
     if (!headerValue) return false;
     const [algo, hash] = headerValue.split('=');
     if (algo !== 'sha256' || !hash) return false;
     const computed = createHmac('sha256', secret).update(rawBody).digest('hex');
     try {
       return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
     } catch {
       return false;
     }
   }
   ```

2. Em cada webhook Meta/WhatsApp:
   - Trocar `await request.json()` por `await request.text()` + `JSON.parse`
   - Antes de parsear, validar:
     ```ts
     const sig = request.headers.get('x-hub-signature-256');
     const secret = process.env.META_APP_SECRET;
     if (!secret && process.env.NODE_ENV === 'production') {
       console.error('[meta-webhook] META_APP_SECRET not configured');
       return NextResponse.json({ error: 'config_error' }, { status: 500 });
     }
     if (secret && !verifyMetaSignature(raw, sig, secret)) {
       console.warn('[meta-webhook] invalid signature');
       return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
     }
     ```

3. Para Resend, adicionar dependência `svix`:
   ```bash
   npm install svix
   ```
   Em `src/app/api/webhooks/resend/route.ts`:
   ```ts
   import { Webhook } from 'svix';
   const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
   const event = wh.verify(rawBody, {
     'svix-id': request.headers.get('svix-id')!,
     'svix-signature': request.headers.get('svix-signature')!,
     'svix-timestamp': request.headers.get('svix-timestamp')!,
   });
   ```

4. Atualizar `.env.example` adicionando:
   ```
   META_APP_SECRET=
   RESEND_WEBHOOK_SECRET=
   ```

5. Atualizar [docs/references/api-integrations.md](../docs/references/api-integrations.md) (se existir) ou CLAUDE.md mencionando os secrets

## Arquivos afetados

- `src/lib/webhooks/verify.ts` (novo)
- `src/app/api/webhooks/meta-leads/route.ts`
- `src/app/api/webhooks/meta-messaging/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/webhooks/resend/route.ts`
- `.env.example`
- `package.json` (svix)

## Como testar

1. Configurar `META_APP_SECRET` em `.env.local`
2. Enviar POST sem signature:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/meta-leads \
     -H "Content-Type: application/json" \
     -d '{"object":"page","entry":[]}'
   ```
   → 403
3. Calcular signature válida e enviar:
   ```bash
   BODY='{"object":"page","entry":[]}'
   SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$META_APP_SECRET" | cut -d' ' -f2)
   curl -X POST http://localhost:3000/api/webhooks/meta-leads \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=$SIG" \
     -d "$BODY"
   ```
   → 200
4. Em dev sem `META_APP_SECRET`: aceita com warning no console
5. Em produção sem secret: 500 com erro de config

## Notas

- `META_APP_SECRET` é compartilhado entre Meta Ads e WhatsApp (ambos usam Meta App)
- Não logar valor do secret nem do header de signature
- Considerar adicionar middleware genérico em vez de repetir em cada rota — mas Next.js App Router não permite middleware por rota fácil; manter inline
- Em fase posterior: adicionar Mercado Pago signature (`X-Signature` + `X-Signature-Ts`)
