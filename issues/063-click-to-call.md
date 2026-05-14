# 063 — Click-to-call do contato/deal

**Tipo:** feature
**Severidade:** alto
**Bloco:** E (SDR/Voz) / A (CRM)
**Dependências:** integração motor de voz já parcial
**Esforço estimado:** L (24-40h)
**Status:** todo

## Contexto

Vendedor não consegue ligar do sistema. Tem que pegar telefone, discar manualmente, depois lembrar de registrar a call. Hoje:
- Sem botão "Ligar agora" em contato/deal
- Sem integração WebRTC/SIP
- Sem popup de chamada inbound

## Critérios de aceite

- [ ] Botão "Ligar" no detail do contato (com ícone telefone)
- [ ] Modo 1: "Click-to-dial" — sistema faz outbound via motor de voz, vendedor atende celular
- [ ] Modo 2 (avançado): WebRTC direto no browser (requer mais infra)
- [ ] Pop-over com info do contato durante call (nome, deal aberto, última atividade)
- [ ] Após call: pop-up para registrar resumo + criar atividade
- [ ] Histórico de calls vinculadas ao deal/contato
- [ ] Configuração: "Telefone do vendedor" para click-to-dial

## Plan

**Decisão para MVP:** começar com Modo 1 (click-to-dial).

1. Adicionar campo `profiles.callback_phone` (telefone do vendedor para callback)
2. UI em `/configuracoes/perfil` para preencher

3. Action `initiateClickToCall(contactId, dealId?)`:
   ```ts
   // 1. Pegar telefone do contato
   // 2. Pegar callback_phone do user atual
   // 3. Chamar motor de voz: cria conferência entre user e contact
   //    (POST /api/voice/click-to-dial com from=callback_phone, to=contact.phone)
   // 4. Cria registro em `calls` table com direction='outbound'
   // 5. Retorna call_id
   ```

4. Componente `<CallNowButton contactId dealId />`:
   - Renderiza botão "Ligar"
   - Click → action + toast "Ligando para você... atenda quando tocar"
   - Mostra modal com info do contato

5. Webhook end-of-call (já existe parcial):
   - Atualiza `calls` com duration, recording_url, etc.
   - Dispara modal de "Registrar resumo" para o user

6. Componente `<CallSummaryModal callId>`:
   - Form: outcome (atendeu, não atendeu, voicemail), notes, next_action
   - Cria activity vinculada
   - Atualiza deal stage opcional

7. Histórico:
   - Em `/contatos/[id]` aba "Ligações" — lista calls com player
   - Em `/negocios/[id]` aba "Ligações" — idem

## Arquivos afetados

- `supabase/migrations/00027_callback_phone.sql` (campo profile)
- `src/lib/actions/calls.ts` (initiate)
- `src/components/calls/call-now-button.tsx` (novo)
- `src/components/calls/call-summary-modal.tsx` (novo)
- `src/components/calls/call-history-list.tsx` (novo)
- `src/app/(main)/configuracoes/perfil/page.tsx` (callback_phone)
- `src/app/(main)/contatos/[id]/page.tsx` (botão + histórico)
- `src/app/(main)/negocios/[id]/page.tsx`
- `src/app/api/telephony/click-to-dial/route.ts` (novo)

## Como testar

1. Configurar `callback_phone` no perfil
2. Abrir contato com phone preenchido
3. Click "Ligar" → toast "Ligando..."
4. Celular do vendedor toca; atende
5. Sistema disca para o contato; conecta
6. Após call, modal de registro aparece
7. Preencher → atividade criada
8. Aba "Ligações" mostra registro

## Notas

- Custo por call (motor de voz cobra por minuto)
- Considerar limite por workspace
- WebRTC (modo 2) é mais barato mas complexo (TURN, codecs, browser perms)
- Em fase futura: integração com fila SDR (vendedor pode entrar na fila)
