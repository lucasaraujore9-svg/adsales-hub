import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Accent = "red" | "yellow" | "orange" | "dark";

interface Palette {
  bg: string;
  bg2: string;
  ink: string;
  highlight: string;
  sticker: string;
  stickerInk: string;
  symbolColor: string;
  glow: string;
  catColor: string;
}

const PALETTES: Record<Accent, Palette> = {
  red: {
    bg: "#0E0E10",
    bg2: "#1A0808",
    ink: "#FAFAF7",
    highlight: "#FFE600",
    sticker: "#E50914",
    stickerInk: "#FFFFFF",
    symbolColor: "#FAFAF7",
    glow: "rgba(229,9,20,.45)",
    catColor: "#FFE600",
  },
  yellow: {
    bg: "#0E0E10",
    bg2: "#1A1500",
    ink: "#FAFAF7",
    highlight: "#FFE600",
    sticker: "#FFE600",
    stickerInk: "#0E0E10",
    symbolColor: "#FAFAF7",
    glow: "rgba(255,230,0,.35)",
    catColor: "#FFE600",
  },
  orange: {
    bg: "#FF5A1F",
    bg2: "#E64B14",
    ink: "#FFFFFF",
    highlight: "#FFE600",
    sticker: "#0E0E10",
    stickerInk: "#FFFFFF",
    symbolColor: "#FFFFFF",
    glow: "rgba(14,14,16,.6)",
    catColor: "#FFE600",
  },
  dark: {
    bg: "#0E0E10",
    bg2: "#16161A",
    ink: "#FAFAF7",
    highlight: "#FF7A3D",
    sticker: "#FAFAF7",
    stickerInk: "#0E0E10",
    symbolColor: "#FAFAF7",
    glow: "rgba(255,90,31,.35)",
    catColor: "#FF5A1F",
  },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface Token {
  text: string;
  highlighted: boolean;
}

function tokenizeHook(hook: string, highlight?: string | null): Token[] {
  const words = hook.split(/\s+/).filter(Boolean);
  if (!highlight) return words.map((w) => ({ text: w, highlighted: false }));

  const highlightWords = highlight.split(/\s+/).filter(Boolean);
  const tokens: Token[] = [];
  let i = 0;
  while (i < words.length) {
    let matched = highlightWords.length > 0;
    for (let j = 0; j < highlightWords.length; j++) {
      if (
        i + j >= words.length ||
        words[i + j].toUpperCase() !== highlightWords[j].toUpperCase()
      ) {
        matched = false;
        break;
      }
    }
    if (matched) {
      for (let j = 0; j < highlightWords.length; j++) {
        tokens.push({ text: words[i + j], highlighted: true });
      }
      i += highlightWords.length;
    } else {
      tokens.push({ text: words[i], highlighted: false });
      i++;
    }
  }
  return tokens;
}

function wrapTokens(tokens: Token[], maxCharsPerLine: number, maxLines: number): Token[][] {
  const lines: Token[][] = [[]];
  let currentLen = 0;
  for (const tok of tokens) {
    if (lines.length > maxLines) break;
    const sep = currentLen === 0 ? 0 : 1;
    const newLen = currentLen + sep + tok.text.length;
    if (newLen > maxCharsPerLine && currentLen > 0) {
      if (lines.length >= maxLines) break;
      lines.push([tok]);
      currentLen = tok.text.length;
    } else {
      lines[lines.length - 1].push(tok);
      currentLen = newLen;
    }
  }
  return lines;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hook = (searchParams.get("hook") ?? "AdSales·Hub").toUpperCase();
  const highlight = searchParams.get("highlight")?.toUpperCase();
  const sticker = searchParams.get("sticker");
  const category = searchParams.get("category") ?? "Blog";
  const accent = (searchParams.get("accent") as Accent) ?? "red";
  const palette = PALETTES[accent] ?? PALETTES.red;

  // Adaptive font sizing — clickbait wants huge, but readable
  let titleSize = 96;
  if (hook.length > 28) titleSize = 86;
  if (hook.length > 38) titleSize = 76;
  if (hook.length > 48) titleSize = 68;
  if (hook.length > 60) titleSize = 60;

  // Generous chars-per-line because we're not measuring exact widths;
  // SVG will render the text naturally with proper spacing
  const charsPerLine =
    titleSize >= 96 ? 16 : titleSize >= 86 ? 19 : titleSize >= 76 ? 22 : titleSize >= 68 ? 25 : 28;
  const tokens = tokenizeHook(hook, highlight);
  const lines = wrapTokens(tokens, charsPerLine, 4);

  // Vertical layout
  const lineHeight = titleSize * 1.05;
  const totalHeight = lines.length * lineHeight;
  const blockHeight = 320; // available vertical space
  const blockTop = 200;
  const startY = blockTop + (blockHeight - totalHeight) / 2 + titleSize * 0.85;

  // Build text using single <text> per line with <tspan> for color changes.
  // SVG renders <tspan>s inline naturally, so spacing between words "just works"
  // when we put a literal " " between them.
  const linesSvg = lines
    .map((lineTokens, lineIdx) => {
      const y = startY + lineIdx * lineHeight;
      const tspans = lineTokens
        .map((tok, i) => {
          const space = i === 0 ? "" : " ";
          const fill = tok.highlighted ? palette.highlight : palette.ink;
          return `<tspan fill="${fill}">${escapeXml(space + tok.text)}</tspan>`;
        })
        .join("");
      return `<text x="80" y="${y}" class="hook" font-size="${titleSize}">${tspans}</text>`;
    })
    .join("\n  ");

  // Sticker (rotated badge top-right) — use text-anchor for safety
  let stickerSvg = "";
  if (sticker) {
    const text = sticker.toUpperCase();
    // Reasonable approximation: bold caps ~14.5px per char at font-size 22
    const textWidth = text.length * 14.5;
    const padX = 22;
    const w = textWidth + padX * 2;
    const h = 56;
    const x = 1100 - w;
    stickerSvg = `<g transform="translate(${x}, 80) rotate(8 ${w / 2} ${h / 2})">
    <rect x="0" y="0" width="${w}" height="${h}" rx="8" ry="8" fill="${palette.sticker}" stroke="${palette.ink}" stroke-width="3" />
    <text x="${w / 2}" y="${h / 2 + 7}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Inter, sans-serif" font-weight="800" font-size="22" fill="${palette.stickerInk}" letter-spacing="0.05em">${escapeXml(text)}</text>
  </g>`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.8">
      <stop offset="0%" stop-color="${palette.glow}" />
      <stop offset="60%" stop-color="${palette.glow.replace(/[\d.]+\)$/, "0)")}" />
    </radialGradient>
    <style>
      .hook { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif; font-weight: 900; letter-spacing: -0.035em; }
      .wm { fill: ${palette.ink}; font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; font-weight: 700; letter-spacing: -0.02em; font-size: 22px; }
      .cat { fill: ${palette.catColor}; font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; font-weight: 700; font-size: 16px; letter-spacing: 0.18em; text-transform: uppercase; }
      .footer { fill: ${palette.ink}; opacity: 0.55; font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; font-weight: 600; font-size: 16px; }
    </style>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGradient)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- Top: symbol + wordmark + category -->
  <g transform="translate(80, 60)">
    <path d="M 9,0 L 31,0 C 35,0 40,5 40,9 L 40,31 C 40,35 35,40 31,40 L 9,40 C 5,40 0,35 0,31 L 0,9 C 0,5 5,0 9,0 Z" fill="${palette.symbolColor}" />
    <circle cx="20" cy="8.4" r="1.4" fill="#FF5A1F" />
    <path d="M20 12 L31.2 23.2 L24.8 23.2 L24.8 31.6 L15.2 31.6 L15.2 23.2 L8.8 23.2 Z" fill="#FF5A1F" />
  </g>
  <text x="138" y="88" class="wm">AdSales<tspan fill="#FF5A1F">·</tspan>Hub</text>
  <text x="80" y="138" class="cat">▸ ${escapeXml(category.toUpperCase())}</text>

  ${stickerSvg}

  ${linesSvg}

  <!-- Footer -->
  <g transform="translate(80, 575)">
    <circle cx="6" cy="6" r="6" fill="#FF5A1F" />
    <text x="22" y="11" class="footer">adsaleshub.7iegroup.com.br</text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
