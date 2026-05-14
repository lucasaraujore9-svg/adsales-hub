import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg)",
        color: "var(--ink)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--accent)",
            }}
          />
          Erro 404
        </span>

        <h1
          style={{
            fontSize: 56,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Página não encontrada
        </h1>

        <p
          style={{
            color: "var(--ink-3)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 420,
          }}
        >
          O endereço que você buscou não existe, foi movido ou está temporariamente indisponível.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 999,
              background: "var(--ink)",
              color: "var(--bg)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Voltar ao início
          </Link>
          <Link
            href="/recursos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Ver recursos
          </Link>
        </div>
      </div>
    </main>
  );
}
