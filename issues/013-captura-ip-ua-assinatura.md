# 013 — Captura IP/UA/geo na assinatura de contrato

**Tipo:** compliance
**Severidade:** alto
**Bloco:** F (Contratos)
**Dependências:** 012
**Esforço estimado:** XS (1-2h)
**Status:** todo

## Contexto

A tabela `contract_signers` (migration inicial) tem campos `ip_address INET`, `geolocation JSONB`, `user_agent TEXT`, mas o webhook/handler de assinatura **nunca os preenche**. Sem esses dados a trilha de auditoria fica incompleta.

## Critérios de aceite

- [ ] Ao assinar contrato, captura `IP` (X-Forwarded-For ou socket)
- [ ] Captura `User-Agent` do header
- [ ] Captura geolocalização aproximada (país/cidade) via IP
- [ ] Salva em `contract_signers` e em evento da issue 012
- [ ] Não bloqueia assinatura se geo falhar (campo opcional)

## Plan

1. Criar `src/lib/server/request-meta.ts`:
   ```ts
   import { headers } from 'next/headers';
   
   export async function getRequestMeta() {
     const h = await headers();
     const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? '').split(',')[0].trim() || null;
     const ua = h.get('user-agent') || null;
     const country = h.get('x-vercel-ip-country') || null;
     const city = h.get('x-vercel-ip-city') || null;
     const region = h.get('x-vercel-ip-country-region') || null;
     return { ip, ua, geo: country ? { country, city, region } : null };
   }
   ```

2. Em [src/app/contrato/[token]/page.tsx](../src/app/contrato/[token]/page.tsx) (action de assinar):
   ```ts
   const meta = await getRequestMeta();
   await admin.from('contract_signers')
     .update({
       signed_at: new Date().toISOString(),
       ip_address: meta.ip,
       user_agent: meta.ua,
       geolocation: meta.geo,
     })
     .eq('id', signerId);
   
   await recordEvent(contractId, 'signed', { 
     signerId, 
     ipAddress: meta.ip, 
     userAgent: meta.ua, 
     geolocation: meta.geo,
   });
   ```

3. Mesmo em ação de "recusar"

4. Em ação de "visualizar" (issue 012), capturar IP/UA também

## Arquivos afetados

- `src/lib/server/request-meta.ts` (novo)
- `src/app/contrato/[token]/page.tsx`
- `src/lib/actions/contracts.ts` (se houver server action separada)

## Como testar

1. Abrir link público de contrato pelo Vercel preview ou local
2. Assinar
3. `SELECT ip_address, user_agent, geolocation FROM contract_signers WHERE id='...'`
4. IP deve estar preenchido (pode ser ::1 em local, OK)
5. UA mostra navegador
6. `geolocation` populado se rodando em Vercel
7. Verificar evento em `contract_signature_events` também

## Notas

- IP em local development pode ser `::1` ou `127.0.0.1`. Aceitável.
- Não armazenar coordenadas precisas (LGPD)
- Em proposals públicas (`/proposta/[token]`) seguir mesma lógica
