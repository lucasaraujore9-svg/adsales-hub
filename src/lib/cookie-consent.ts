/**
 * Gerenciamento de consentimento de cookies (LGPD Art. 8º + Resolução ANPD nº 2/2022).
 *
 * Categorias:
 * - essential: sempre on (autenticação, segurança); não pode ser desabilitado.
 * - analytics: estatísticas de uso anônimas.
 * - marketing: pixels/remarketing de terceiros.
 *
 * Persistência: localStorage (TTL 6 meses).
 */

export type ConsentCategory = "essential" | "analytics" | "marketing";

export type ConsentChoices = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

type StoredConsent = {
  version: number;
  choices: ConsentChoices;
  timestamp: number;
};

const STORAGE_KEY = "adsales:cookie-consent";
const VERSION = 1;
const TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 dias

export const DEFAULT_CHOICES: ConsentChoices = {
  essential: true,
  analytics: false,
  marketing: false,
};

export const ACCEPT_ALL: ConsentChoices = {
  essential: true,
  analytics: true,
  marketing: true,
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Lê estado salvo. Retorna null se inexistente, expirado ou inválido. */
export function getConsent(): ConsentChoices | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== VERSION) return null;
    if (Date.now() - parsed.timestamp > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { ...parsed.choices, essential: true };
  } catch {
    return null;
  }
}

/** Persiste novo estado e dispara evento custom para listeners. */
export function setConsent(choices: ConsentChoices): void {
  if (!isBrowser()) return;
  const payload: StoredConsent = {
    version: VERSION,
    choices: { ...choices, essential: true },
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("adsales:consent-change", { detail: payload.choices }));
  } catch {
    /* storage cheio ou bloqueado: ignorar */
  }
}

/** Helper para componentes que dependem de uma categoria específica. */
export function hasConsent(category: ConsentCategory): boolean {
  const c = getConsent();
  if (!c) return category === "essential";
  return c[category];
}

/** Apaga consentimento (mostra banner de novo). */
export function clearConsent(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("adsales:consent-change", { detail: null }));
  } catch {
    /* ignore */
  }
}
