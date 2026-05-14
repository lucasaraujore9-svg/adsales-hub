# 015 — Mensagens de erro Supabase amigáveis

**Tipo:** fix
**Severidade:** médio
**Bloco:** Infra
**Dependências:** nenhuma
**Esforço estimado:** S (3-4h)
**Status:** todo

## Contexto

Quando ocorre erro do Supabase (ex: "duplicate key value violates unique constraint", "JWT expired"), o `error.message` bruto chega na UI. Usuário leigo lê isso e entra em pânico ou abandona.

Exemplos:
- [src/lib/auth/actions.ts:90](../src/lib/auth/actions.ts) — `return { error: error.message }`
- [src/app/onboarding/actions.ts](../src/app/onboarding/actions.ts) — idem
- Várias actions em `src/lib/actions/*`

## Critérios de aceite

- [ ] Função utilitária `friendlyError(err)` em pt-BR
- [ ] Mapeamento das mensagens mais comuns:
  - duplicate key → "Este registro já existe"
  - permission denied / RLS → "Você não tem permissão para esta ação"
  - JWT expired → "Sua sessão expirou. Faça login novamente."
  - network → "Erro de conexão. Tente novamente."
  - quota / rate limit → "Muitas tentativas. Aguarde um momento."
  - unique violation em email → "Email já cadastrado"
  - foreign key → "Item relacionado não existe"
- [ ] Default genérico amigável: "Não foi possível concluir a operação. Tente novamente."
- [ ] Erro real é logado com console.error completo (para debug)
- [ ] Aplicado em todas as actions que retornam `{ error: error.message }` direto

## Plan

1. Criar `src/lib/errors/friendly.ts`:
   ```ts
   type FriendlyContext = 'auth' | 'crud' | 'payment' | 'webhook' | 'generic';
   
   export function friendlyError(err: unknown, ctx: FriendlyContext = 'generic'): string {
     if (!err) return "Erro desconhecido. Tente novamente.";
     const raw = err instanceof Error ? err.message : String(err);
     console.error(`[error:${ctx}]`, raw);
     
     const lower = raw.toLowerCase();
     
     // Auth-specific
     if (lower.includes('invalid login') || lower.includes('invalid_grant')) 
       return "Email ou senha incorretos.";
     if (lower.includes('email not confirmed')) 
       return "Confirme seu email antes de fazer login.";
     if (lower.includes('jwt expired') || lower.includes('session expired'))
       return "Sua sessão expirou. Faça login novamente.";
     
     // DB constraints
     if (lower.includes('duplicate key') && lower.includes('email'))
       return "Este email já está cadastrado.";
     if (lower.includes('duplicate key'))
       return "Este registro já existe.";
     if (lower.includes('foreign key'))
       return "Não é possível concluir: existe item relacionado.";
     if (lower.includes('not null') || lower.includes('violates'))
       return "Preencha todos os campos obrigatórios.";
     
     // Permissions
     if (lower.includes('permission denied') || lower.includes('rls') || lower.includes('row-level security'))
       return "Você não tem permissão para esta ação.";
     
     // Network / rate
     if (lower.includes('network') || lower.includes('fetch failed'))
       return "Erro de conexão. Tente novamente.";
     if (lower.includes('rate limit') || lower.includes('too many requests'))
       return "Muitas tentativas. Aguarde um momento.";
     
     // Payment
     if (lower.includes('card') && lower.includes('declined'))
       return "Cartão recusado. Tente outro método.";
     if (lower.includes('insufficient'))
       return "Saldo insuficiente.";
     
     // Default
     return "Não foi possível concluir a operação. Tente novamente.";
   }
   ```

2. Substituir em arquivos críticos:
   - [src/lib/auth/actions.ts](../src/lib/auth/actions.ts): `friendlyError(err, 'auth')`
   - [src/app/onboarding/actions.ts](../src/app/onboarding/actions.ts)
   - [src/lib/actions/billing.ts](../src/lib/actions/billing.ts): `friendlyError(err, 'payment')`
   - Arquivos de actions principais

3. Buscar `error.message` em retornos de actions:
   ```bash
   grep -rn "error: error.message\|error: err.message" src/lib/actions src/app
   ```

4. Trocar cada um por `error: friendlyError(error, 'crud')` (ou contexto adequado)

## Arquivos afetados

- `src/lib/errors/friendly.ts` (novo)
- `src/lib/auth/actions.ts`
- `src/app/onboarding/actions.ts`
- ~15 arquivos de actions (descobrir via grep)

## Como testar

1. Tentar criar contato com email duplicado → "Este email já está cadastrado." (não "duplicate key value...")
2. Tentar login com senha errada → "Email ou senha incorretos."
3. Stripe fail → "Cartão recusado. Tente outro método."
4. Console mostra erro técnico completo (para debug)
5. UI mostra mensagem amigável

## Notas

- Não substituir mensagens onde o erro é já intencionalmente curto (Zod validations já têm pt-BR)
- Manter erro original em logs (importante para debug)
- Em fase futura: i18n de mensagens
