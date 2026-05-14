"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Settings, X } from "lucide-react";
import {
  ACCEPT_ALL,
  DEFAULT_CHOICES,
  type ConsentChoices,
  getConsent,
  setConsent,
} from "@/lib/cookie-consent";
import { CookieSettingsModal } from "./cookie-settings-modal";

/**
 * Banner de consentimento de cookies (LGPD).
 * Aparece na primeira visita; somem após escolha.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    // Atrasa um tick para evitar flash no SSR
    const t = setTimeout(() => {
      setVisible(getConsent() === null);
    }, 50);

    function onChange() {
      setVisible(getConsent() === null);
    }
    window.addEventListener("adsales:consent-change", onChange);
    return () => {
      clearTimeout(t);
      window.removeEventListener("adsales:consent-change", onChange);
    };
  }, []);

  function acceptAll() {
    setConsent(ACCEPT_ALL);
    setVisible(false);
  }
  function acceptEssentialOnly() {
    setConsent(DEFAULT_CHOICES);
    setVisible(false);
  }
  function handleSave(choices: ConsentChoices) {
    setConsent(choices);
    setVisible(false);
    setOpenSettings(false);
  }

  if (!visible) {
    return (
      <CookieSettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onSave={handleSave}
      />
    );
  }

  return (
    <>
      <div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--line)] bg-[color:var(--panel)] shadow-2xl"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-5 py-4 sm:flex-row sm:items-center">
          <Cookie
            className="hidden h-6 w-6 shrink-0 text-[color:var(--accent)] sm:block"
            aria-hidden
          />
          <div className="flex-1 text-sm text-[color:var(--ink-2)]">
            <p id="cookie-banner-title" className="mb-1 font-medium text-[color:var(--ink)]">
              Usamos cookies para melhorar sua experiência.
            </p>
            <p id="cookie-banner-desc" className="text-xs text-[color:var(--ink-3)]">
              Cookies essenciais sempre ativos. Analytics e marketing precisam do seu consentimento.{" "}
              <Link href="/privacy" className="underline hover:text-[color:var(--ink)]">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setOpenSettings(true)}
              className="inline-flex items-center gap-1 rounded-pill border border-[color:var(--line-2)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--bg-2)]"
            >
              <Settings className="h-3 w-3" /> Configurar
            </button>
            <button
              type="button"
              onClick={acceptEssentialOnly}
              className="rounded-pill border border-[color:var(--line-2)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--bg-2)]"
            >
              Apenas essenciais
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-pill bg-[color:var(--ink)] px-4 py-1.5 text-xs font-medium text-[color:var(--bg)] hover:bg-[color:var(--ink-2)]"
            >
              Aceitar todos
            </button>
            <button
              type="button"
              onClick={acceptEssentialOnly}
              aria-label="Fechar (aceita apenas essenciais)"
              className="rounded-full p-1 text-[color:var(--ink-3)] hover:bg-[color:var(--bg-2)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <CookieSettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onSave={handleSave}
      />
    </>
  );
}
