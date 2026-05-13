import type { SVGProps } from "react";

/**
 * Brand Book v2 — Símbolo oficial.
 * Squircle preto com ponto + seta laranja.
 */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      style={{ width: size, height: size, display: "block" }}
      aria-label="AdSales/Hub"
    >
      <path
        d="M 14.4,0 L 49.6,0 C 56.08,0 64,7.92 64,14.4 L 64,49.6 C 64,56.08 56.08,64 49.6,64 L 14.4,64 C 7.92,64 0,56.08 0,49.6 L 0,14.4 C 0,7.92 7.92,0 14.4,0 Z"
        fill="#0E0E10"
      />
      <circle cx="32" cy="13.4" r="2.24" fill="#FF5A1F" />
      <path
        d="M32 19.2 L49.92 37.12 L39.68 37.12 L39.68 50.56 L24.32 50.56 L24.32 37.12 L14.08 37.12 Z"
        fill="#FF5A1F"
      />
    </svg>
  );
}

/**
 * App icon "stamp" — círculo Brasa com seta branca.
 * Usado em hero/CTAs de destaque (como o final CTA do brand book).
 */
export function LogoStamp({ size = 56 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{ width: size, height: size, display: "block" }}
      aria-label="AdSales/Hub"
    >
      <circle cx="100" cy="100" r="100" fill="var(--accent)" />
      <circle cx="100" cy="42" r="7" fill="#FFFFFF" />
      <path
        d="M100 60 L156 116 L124 116 L124 158 L76 158 L76 116 L44 116 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function Arrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

export function Plus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Wordmark "AdSales·Hub" with orange dot, Inter 600. */
export function Wordmark({ size = 17 }: { size?: number }) {
  return (
    <span className="wm" style={{ fontSize: size }}>
      AdSales<span className="slash">·</span>Hub
    </span>
  );
}
