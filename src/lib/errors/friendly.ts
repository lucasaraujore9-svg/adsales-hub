/**
 * Converte erros internos (Supabase, Stripe, etc.) em mensagens
 * amigáveis em pt-BR para usuário leigo.
 *
 * O erro original é logado em console.error para debug;
 * apenas a mensagem amigável é retornada.
 */

export type FriendlyContext =
  | "auth"
  | "crud"
  | "payment"
  | "webhook"
  | "import"
  | "ai"
  | "generic";

export function friendlyError(
  err: unknown,
  ctx: FriendlyContext = "generic"
): string {
  if (!err) return "Erro desconhecido. Tente novamente.";

  const raw = err instanceof Error ? err.message : String(err);
  // Log completo do erro original para debug
  if (typeof console !== "undefined" && process.env.NODE_ENV !== "test") {
    console.error(`[error:${ctx}]`, raw);
  }

  const lower = raw.toLowerCase();

  // ---- Auth ----
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid_credentials") ||
    lower.includes("invalid_grant")
  ) {
    return "Email ou senha incorretos.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirme seu email antes de fazer login.";
  }
  if (
    lower.includes("jwt expired") ||
    lower.includes("session expired") ||
    lower.includes("invalid jwt")
  ) {
    return "Sua sessão expirou. Faça login novamente.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Muitas tentativas. Aguarde alguns minutos.";
  }
  if (lower.includes("user already registered")) {
    return "Este email já está cadastrado. Faça login.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Senha muito fraca. Use 8+ caracteres com letras, números e símbolos.";
  }

  // ---- DB constraints ----
  if (lower.includes("duplicate key") && lower.includes("email")) {
    return "Este email já está cadastrado.";
  }
  if (lower.includes("duplicate key") || lower.includes("already exists")) {
    return "Este registro já existe.";
  }
  if (lower.includes("foreign key")) {
    return "Não é possível concluir: existe um item relacionado.";
  }
  if (lower.includes("not null") || lower.includes("violates not-null")) {
    return "Preencha todos os campos obrigatórios.";
  }
  if (lower.includes("check constraint")) {
    return "Valor inválido para um dos campos.";
  }

  // ---- Permissions ----
  if (
    lower.includes("permission denied") ||
    lower.includes("insufficient_privilege") ||
    lower.includes("rls") ||
    lower.includes("row-level security") ||
    lower.includes("policy")
  ) {
    return "Você não tem permissão para esta ação.";
  }
  if (lower.includes("forbidden") || lower.includes("403")) {
    return "Acesso negado.";
  }
  if (lower.includes("not found") || lower.includes("404")) {
    return "Item não encontrado.";
  }

  // ---- Network ----
  if (
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout")
  ) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }
  if (lower.includes("timeout")) {
    return "A operação demorou demais. Tente novamente.";
  }

  // ---- Payment / Stripe ----
  if (ctx === "payment" || lower.includes("stripe") || lower.includes("payment")) {
    if (lower.includes("card") && lower.includes("declined")) {
      return "Cartão recusado. Tente outro método de pagamento.";
    }
    if (lower.includes("insufficient")) {
      return "Saldo insuficiente.";
    }
    if (lower.includes("expired")) {
      return "Cartão expirado.";
    }
    if (lower.includes("invalid card")) {
      return "Dados do cartão inválidos.";
    }
    if (lower.includes("no such customer")) {
      return "Conta de pagamento não encontrada. Contate o suporte.";
    }
    return "Erro no processamento do pagamento. Tente novamente.";
  }

  // ---- AI / quota ----
  if (ctx === "ai" || lower.includes("anthropic") || lower.includes("openai")) {
    if (lower.includes("quota") || lower.includes("credits") || lower.includes("balance")) {
      return "Limite de IA atingido. Upgrade seu plano ou aguarde.";
    }
    if (lower.includes("overloaded") || lower.includes("rate")) {
      return "IA temporariamente indisponível. Tente em alguns segundos.";
    }
    return "Erro ao processar com IA. Tente novamente.";
  }

  // ---- Webhook signature ----
  if (
    lower.includes("signature") ||
    lower.includes("unauthorized webhook") ||
    lower.includes("invalid signature")
  ) {
    return "Assinatura de webhook inválida.";
  }

  // ---- Import / file ----
  if (ctx === "import") {
    if (lower.includes("invalid format") || lower.includes("malformed")) {
      return "Arquivo em formato inválido.";
    }
    if (lower.includes("size") || lower.includes("too large")) {
      return "Arquivo muito grande.";
    }
    return "Erro ao importar arquivo. Verifique o formato.";
  }

  // Default
  return "Não foi possível concluir a operação. Tente novamente.";
}
