# 004 — Confirmação de senha + força mínima no signup

**Tipo:** fix
**Severidade:** crítico
**Bloco:** Infra
**Dependências:** nenhuma
**Esforço estimado:** XS (2h)
**Status:** todo

## Contexto

Em [src/app/(auth)/signup/page.tsx](../src/app/(auth)/signup/page.tsx) o formulário de cadastro tem um único campo de senha (`minLength={8}`), sem:
- Confirmação (repeat password)
- Indicador de força
- Checklist visual de requisitos

Usuário leigo erra digitação, cria conta com senha que não pretendia, e fica trancado depois.

Schema em [src/lib/auth/actions.ts](../src/lib/auth/actions.ts) também aceita senha fraca (só 8 chars).

## Critérios de aceite

- [ ] 2 campos: "Senha" e "Confirmar senha"
- [ ] Validação Zod: senhas devem coincidir
- [ ] Senha exige: 8+ chars, 1 maiúscula, 1 número, 1 especial
- [ ] Checklist visual abaixo do campo (✓/✗ para cada requisito) atualiza em tempo real
- [ ] Eye icon para mostrar/ocultar em ambos os campos
- [ ] Botão de submit desabilitado enquanto senhas inválidas/divergentes
- [ ] Mensagem clara em pt-BR se requisito não atendido

## Plan

1. Atualizar schema Zod em [src/lib/auth/actions.ts](../src/lib/auth/actions.ts) `signupSchema`:
   ```ts
   const signupSchema = z.object({
     email: z.string().email("Email inválido"),
     password: z.string()
       .min(8, "Mínimo 8 caracteres")
       .regex(/[A-Z]/, "Precisa de pelo menos 1 letra maiúscula")
       .regex(/[0-9]/, "Precisa de pelo menos 1 número")
       .regex(/[^a-zA-Z0-9]/, "Precisa de 1 caractere especial"),
     password_confirm: z.string(),
     name: z.string().min(2, "Nome muito curto"),
   }).refine(d => d.password === d.password_confirm, {
     message: "As senhas não coincidem",
     path: ["password_confirm"],
   });
   ```

2. Criar `src/components/auth/password-strength-meter.tsx` (client):
   - Recebe `password: string` por prop
   - Renderiza checklist de 4 itens com ✓ verde / ✗ cinza
   - Barra de força (fraca/média/forte) baseada em quantos critérios atendidos

3. Criar `src/components/auth/password-input.tsx` (client):
   - Wrapper de Input com botão de eye toggle (mostrar/ocultar)
   - Aceita props padrão de Input + `showStrength?: boolean`

4. Atualizar [src/app/(auth)/signup/page.tsx](../src/app/(auth)/signup/page.tsx):
   - Substituir campo de senha por `<PasswordInput name="password" showStrength />`
   - Adicionar `<PasswordInput name="password_confirm" />`
   - Botão `disabled` quando confirma vazio ou não bate

5. Validar no submit: se Zod falhar com `path: ['password_confirm']`, mostrar erro inline

## Arquivos afetados

- `src/lib/auth/actions.ts` (schema)
- `src/components/auth/password-strength-meter.tsx` (novo)
- `src/components/auth/password-input.tsx` (novo)
- `src/app/(auth)/signup/page.tsx`

## Como testar

1. Acessar `/signup`
2. Digitar senha "12345678" → checklist mostra: ✓ 8 chars, ✗ maiúscula, ✗ número (não, tem), ✗ especial
3. Digitar "Senha@123" → todos ✓, barra "Forte"
4. Confirmação vazia → botão disabled
5. Confirmação "Senha@124" (diferente) → erro "As senhas não coincidem"
6. Confirmação "Senha@123" → botão habilita
7. Eye icon: clica, mostra texto; clica de novo, oculta
8. Submeter: cria conta normalmente
9. Tentar via API direto com senha fraca: 400 com mensagem Zod

## Notas

- Não armazenar senha em estado externo nem logar
- Email já tem validação Zod, mantém igual
- Considerar autocomplete `new-password` em ambos os campos
