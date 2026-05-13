import "server-only";

import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "node:path";

const FONT_PATH = path.join(process.cwd(), "public", "fonts", "InterVariable.ttf");

let fontRegistered = false;
function ensureFontRegistered() {
  if (fontRegistered) return;
  try {
    GlobalFonts.registerFromPath(FONT_PATH, "Inter");
    fontRegistered = true;
  } catch (err) {
    console.error("[text-overlay] failed to register Inter font", err);
    // We continue — canvas will fall back to a system sans-serif.
    fontRegistered = true;
  }
}

export type OverlayPosition = "top" | "bottom" | "center" | "left" | "right" | "none";
export type OverlayPalette = "brand-orange" | "warm" | "cool" | "neutral" | "monochrome" | "vibrant" | "custom" | string;

export interface CompositeTextOverlayInput {
  /** Buffer of the source image (PNG/JPEG decoded by @napi-rs/canvas) */
  imageBuffer: Buffer | Uint8Array;
  /** Main headline (large bold) */
  headline: string;
  /** Optional supporting line (smaller, lighter) */
  subheadline?: string;
  /** Where the text block sits */
  position: OverlayPosition;
  /** Palette key — used to choose accent color */
  palette?: OverlayPalette;
}

const ACCENT_BY_PALETTE: Record<string, string> = {
  "brand-orange": "#FF5E1A",
  warm: "#FF7A45",
  cool: "#3B82F6",
  neutral: "#FF5E1A",
  monochrome: "#FF5E1A",
  vibrant: "#FF1F5E",
  custom: "#FF5E1A",
};

interface RenderedLine {
  text: string;
  width: number;
}

function wrapToLines(
  ctx: import("@napi-rs/canvas").SKRSContext2D,
  text: string,
  maxWidth: number,
): RenderedLine[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: RenderedLine[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    const w = ctx.measureText(candidate).width;
    if (w <= maxWidth) {
      current = candidate;
    } else {
      lines.push({ text: current, width: ctx.measureText(current).width });
      current = words[i];
    }
  }
  lines.push({ text: current, width: ctx.measureText(current).width });
  return lines;
}

/**
 * Composite a typography overlay onto an image. Returns PNG buffer.
 *
 * Design choices:
 * - Auto-sizes headline based on canvas width (clamped between 5% and 9% of width).
 * - Sub-headline at ~45% of headline size, opacity 0.85.
 * - Soft dark gradient pad behind the text block for guaranteed legibility.
 * - 4px accent rule above the headline using the brand color.
 * - Mobile-safe padding (6% inset).
 */
export async function compositeTextOverlay(
  input: CompositeTextOverlayInput,
): Promise<Buffer> {
  ensureFontRegistered();

  const img = await loadImage(input.imageBuffer);
  const W = img.width;
  const H = img.height;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, W, H);

  const accent = ACCENT_BY_PALETTE[input.palette ?? "brand-orange"] ?? "#FF5E1A";
  const inset = Math.round(Math.min(W, H) * 0.06);
  const maxTextWidth = W - inset * 2;

  // Auto-sized headline. 7% of width, clamped 36-120px.
  const headlineSize = Math.max(36, Math.min(120, Math.round(W * 0.07)));
  const subSize = Math.round(headlineSize * 0.45);
  const lineGap = Math.round(headlineSize * 0.15);

  ctx.textBaseline = "top";

  // Layout headline lines (uppercase for impact).
  ctx.font = `800 ${headlineSize}px Inter`;
  const headlineUpper = input.headline.trim().toUpperCase();
  const headlineLines = wrapToLines(ctx, headlineUpper, maxTextWidth);
  const headlineHeight =
    headlineLines.length * headlineSize + (headlineLines.length - 1) * lineGap;

  let subLines: RenderedLine[] = [];
  if (input.subheadline?.trim()) {
    ctx.font = `500 ${subSize}px Inter`;
    subLines = wrapToLines(ctx, input.subheadline.trim(), maxTextWidth);
  }
  const subHeight = subLines.length
    ? subLines.length * subSize + (subLines.length - 1) * Math.round(subSize * 0.2)
    : 0;
  const subGap = subLines.length ? Math.round(headlineSize * 0.35) : 0;

  const accentRuleHeight = Math.max(3, Math.round(headlineSize * 0.07));
  const accentGap = Math.round(headlineSize * 0.35);

  const totalBlockHeight =
    accentRuleHeight + accentGap + headlineHeight + subGap + subHeight;

  // Decide block position + alignment.
  let blockX = inset;
  let blockY = 0;
  let textAlign: "left" | "center" | "right" = "left";

  switch (input.position) {
    case "top":
      blockY = inset;
      blockX = inset;
      textAlign = "left";
      break;
    case "bottom":
      blockY = H - inset - totalBlockHeight;
      blockX = inset;
      textAlign = "left";
      break;
    case "center":
      blockY = Math.round((H - totalBlockHeight) / 2);
      blockX = Math.round(W / 2);
      textAlign = "center";
      break;
    case "left":
      blockY = Math.round((H - totalBlockHeight) / 2);
      blockX = inset;
      textAlign = "left";
      break;
    case "right":
      blockY = Math.round((H - totalBlockHeight) / 2);
      blockX = W - inset;
      textAlign = "right";
      break;
    default:
      blockY = H - inset - totalBlockHeight;
      blockX = inset;
      textAlign = "left";
  }

  // Backdrop: soft dark gradient strip behind text for guaranteed legibility.
  const padTop = Math.round(headlineSize * 0.6);
  const padBottom = Math.round(headlineSize * 0.6);
  const padX = Math.round(headlineSize * 0.5);

  if (input.position === "top") {
    const gradH = blockY + totalBlockHeight + padBottom;
    const grad = ctx.createLinearGradient(0, 0, 0, gradH);
    grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, gradH);
  } else if (input.position === "bottom") {
    const gradY = blockY - padTop;
    const gradH = H - gradY;
    const grad = ctx.createLinearGradient(0, gradY, 0, H);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.7)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, gradY, W, gradH);
  } else if (input.position === "center") {
    // Soft dark scrim full width
    const scrimY = blockY - padTop;
    const scrimH = totalBlockHeight + padTop + padBottom;
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, scrimY, W, scrimH);
  } else if (input.position === "left" || input.position === "right") {
    // Vertical gradient on that side (40% of width)
    const sideW = Math.round(W * 0.45);
    const gradX = input.position === "left" ? 0 : W - sideW;
    const grad = ctx.createLinearGradient(
      gradX,
      0,
      input.position === "left" ? gradX + sideW : gradX,
      0,
    );
    grad.addColorStop(0, "rgba(0, 0, 0, 0.7)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(gradX, 0, sideW, H);
  }

  // Draw accent rule.
  let cursorY = blockY;
  ctx.fillStyle = accent;
  const ruleWidth = Math.max(60, Math.round(headlineSize * 1.5));
  let ruleX = blockX;
  if (textAlign === "center") ruleX = blockX - Math.round(ruleWidth / 2);
  if (textAlign === "right") ruleX = blockX - ruleWidth;
  ctx.fillRect(ruleX, cursorY, ruleWidth, accentRuleHeight);
  cursorY += accentRuleHeight + accentGap;

  // Draw headline (white, 800 weight, with subtle shadow for legibility).
  ctx.font = `800 ${headlineSize}px Inter`;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = Math.round(headlineSize * 0.15);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(headlineSize * 0.04);

  for (const line of headlineLines) {
    let drawX = blockX;
    if (textAlign === "center") drawX = blockX - line.width / 2;
    if (textAlign === "right") drawX = blockX - line.width;
    ctx.fillText(line.text, drawX, cursorY);
    cursorY += headlineSize + lineGap;
  }
  cursorY = cursorY - lineGap; // remove trailing gap
  cursorY += subGap;

  // Draw sub-headline (white 500, slightly transparent).
  if (subLines.length) {
    ctx.font = `500 ${subSize}px Inter`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.shadowBlur = Math.round(subSize * 0.18);
    ctx.shadowOffsetY = Math.round(subSize * 0.04);
    const subLineGap = Math.round(subSize * 0.2);
    for (const line of subLines) {
      let drawX = blockX;
      if (textAlign === "center") drawX = blockX - line.width / 2;
      if (textAlign === "right") drawX = blockX - line.width;
      ctx.fillText(line.text, drawX, cursorY);
      cursorY += subSize + subLineGap;
    }
  }

  return canvas.toBuffer("image/png");
}
