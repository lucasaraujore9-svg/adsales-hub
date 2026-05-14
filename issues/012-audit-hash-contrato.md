# 012 — Trilha de auditoria + hash criptográfico de assinatura

**Tipo:** compliance
**Severidade:** crítico
**Bloco:** F (Contratos)
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Lei 14.063/2020 (assinatura eletrônica simples) exige trilha de auditoria completa para validade jurídica. Hoje:

- Sem hash SHA-256 do conteúdo do contrato (cliente pode contestar "isto não é o que assinei")
- Sem tabela de eventos imutáveis (visualizou, abriu link, assinou)
- Sem PDF final certificado anexado

Risco: contratos podem ser anulados em juízo.

## Critérios de aceite

- [ ] Tabela `contract_signature_events` com PK + timestamp imutável
- [ ] Eventos registrados: `link_sent`, `viewed`, `signed`, `declined`, `revoked`
- [ ] Hash SHA-256 do conteúdo do contrato salvo em `contracts.content_hash`
- [ ] Re-renderização do contrato verifica hash (alerta se mudou)
- [ ] PDF final tem página de "Manifesto de assinatura" com:
  - Hash SHA-256 do documento
  - Lista de signatários com IP/UA/data/hora
  - QR code para verificação
- [ ] PDF anexado em `contracts.signed_pdf_url`
- [ ] Endpoint público `/contrato/verificar?hash=X` mostra metadados

## Plan

1. Migração `supabase/migrations/00014_contract_audit_trail.sql`:
   ```sql
   ALTER TABLE contracts
     ADD COLUMN IF NOT EXISTS content_hash TEXT,
     ADD COLUMN IF NOT EXISTS signed_pdf_url TEXT,
     ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE;
   
   CREATE TABLE IF NOT EXISTS contract_signature_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
     workspace_id UUID NOT NULL REFERENCES workspaces(id),
     event_type TEXT NOT NULL CHECK (event_type IN (
       'link_sent', 'viewed', 'signed', 'declined', 'revoked', 'reminder_sent'
     )),
     signer_id UUID REFERENCES contract_signers(id),
     ip_address INET,
     user_agent TEXT,
     geolocation JSONB,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   
   CREATE INDEX idx_contract_events_contract ON contract_signature_events(contract_id, created_at);
   
   -- Imutabilidade: bloquear UPDATE/DELETE
   CREATE OR REPLACE FUNCTION block_event_modification()
   RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'Audit events are immutable';
   END;
   $$ LANGUAGE plpgsql;
   
   CREATE TRIGGER prevent_event_update BEFORE UPDATE ON contract_signature_events
     FOR EACH ROW EXECUTE FUNCTION block_event_modification();
   CREATE TRIGGER prevent_event_delete BEFORE DELETE ON contract_signature_events
     FOR EACH ROW EXECUTE FUNCTION block_event_modification();
   ```

2. Criar `src/lib/contracts/hash.ts`:
   ```ts
   import { createHash } from 'node:crypto';
   
   export function hashContractContent(content: string): string {
     return createHash('sha256').update(content, 'utf8').digest('hex');
   }
   ```

3. Atualizar geração de contrato (`src/lib/actions/contracts.ts`):
   - Após renderizar variáveis, calcular hash e salvar em `contracts.content_hash`
   - Gerar `verification_token` único (UUID)

4. Criar `src/lib/contracts/audit.ts` com função `recordEvent(contractId, eventType, opts)`:
   - Insere em `contract_signature_events`
   - Captura IP/UA do request

5. Em [src/app/contrato/[token]/page.tsx](../src/app/contrato/[token]/page.tsx):
   - No GET (visualização) → `recordEvent('viewed')`
   - Na ação de assinar → `recordEvent('signed', { signerId, ip, ua })`
   - Em recusar → `recordEvent('declined')`

6. Criar gerador de PDF certificado (`src/lib/contracts/pdf.ts`):
   - Usar lib leve (puppeteer não é viável serverless; usar `@react-pdf/renderer` ou alternativa edge-friendly)
   - Renderiza conteúdo + página final "Manifesto de Assinatura":
     - Hash do documento
     - Tabela de signatários
     - Eventos com timestamp
     - QR code para `/contrato/verificar?token=X`
   - Salva em Storage `contracts/signed/{contract_id}.pdf`
   - Atualiza `contracts.signed_pdf_url`

7. Criar `src/app/contrato/verificar/page.tsx` (público):
   - Recebe `?token=X`
   - Busca contrato + eventos
   - Mostra: hash, signatários, eventos com data/IP
   - Não expõe conteúdo do contrato (privacidade)

## Arquivos afetados

- `supabase/migrations/00014_contract_audit_trail.sql` (novo)
- `src/lib/contracts/hash.ts` (novo)
- `src/lib/contracts/audit.ts` (novo)
- `src/lib/contracts/pdf.ts` (novo ou atualizar)
- `src/lib/actions/contracts.ts`
- `src/app/contrato/[token]/page.tsx`
- `src/app/contrato/verificar/page.tsx` (novo)

## Como testar

1. Aplicar migração
2. Criar contrato a partir de um deal
3. Verificar `contracts.content_hash` populado
4. Abrir link público → evento `viewed` registrado em `contract_signature_events` com IP
5. Assinar → evento `signed` com signer_id
6. PDF gerado em Storage, `signed_pdf_url` atualizado
7. Acessar `/contrato/verificar?token=X` → mostra hash + eventos
8. Tentar UPDATE em `contract_signature_events` → erro "Audit events are immutable"
9. Modificar conteúdo do contrato (manualmente no DB) → hash recalculado deve diferir do salvo

## Notas

- Geração de PDF é a parte mais complexa. Para MVP, pode ser HTML + print-to-PDF do lado do cliente (limitado mas funciona)
- Em fase futura: integrar com Clicksign/D4Sign/DocuSign para validade ICP-Brasil
- Não armazenar geolocalização precisa (só país/região via IP) para reduzir risco LGPD
- Verificar token deve ser revelável; conteúdo não
