import "server-only";

// Presets curated for social media advertising. Keys are the form values;
// descriptions are the natural-language fragments composed into the final
// prompt. The prompt is engineered for FLUX.1-schnell and similar fast
// diffusion models that pay disproportionate attention to the first ~50 tokens
// — so we front-load the structural decisions (style, composition, palette,
// lighting) and put descriptive content (subject, scene) afterward.
//
// Text overlays are NOT requested from the model. We render them server-side
// via `text-overlay.ts` because diffusion models are unreliable at rendering
// crisp typography. The brief's `headline` is composed onto the image in a
// second stage.

export const STYLE_OPTIONS = [
  { value: "editorial-photo", label: "Foto editorial premium" },
  { value: "product-photo", label: "Foto de produto (clean)" },
  { value: "lifestyle-photo", label: "Foto lifestyle (com pessoas)" },
  { value: "cinematic", label: "Cinematográfica" },
  { value: "minimalist", label: "Minimalista flat" },
  { value: "illustration-2d", label: "Ilustração 2D moderna" },
  { value: "illustration-3d", label: "Render 3D" },
  { value: "isometric", label: "Isometrico 3D" },
] as const;

export const MOOD_OPTIONS = [
  { value: "premium", label: "Premium e sofisticado" },
  { value: "energetic", label: "Energético e vibrante" },
  { value: "calm", label: "Calmo e sereno" },
  { value: "professional", label: "Profissional e confiável" },
  { value: "playful", label: "Divertido e jovem" },
  { value: "futuristic", label: "Tecnológico e futurista" },
] as const;

export const LIGHTING_OPTIONS = [
  { value: "natural", label: "Natural (luz do dia)" },
  { value: "studio", label: "Estúdio (soft key + fill)" },
  { value: "golden-hour", label: "Golden hour (entardecer)" },
  { value: "dramatic", label: "Dramática (alto contraste)" },
  { value: "soft-diffused", label: "Suave difusa" },
  { value: "neon", label: "Neon (cyan + magenta)" },
  { value: "backlit", label: "Contraluz (rim light)" },
] as const;

export const PALETTE_OPTIONS = [
  { value: "brand-orange", label: "Marca AdSales (laranja #FF5E1A)" },
  { value: "warm", label: "Quente (laranjas, vermelhos, âmbar)" },
  { value: "cool", label: "Fria (azuis, teal, índigo)" },
  { value: "neutral", label: "Neutra (off-white, bege, carvão)" },
  { value: "monochrome", label: "Monocromática + 1 accent" },
  { value: "vibrant", label: "Vibrante saturada" },
  { value: "custom", label: "Personalizada (descrever abaixo)" },
] as const;

export const COMPOSITION_OPTIONS = [
  { value: "centered", label: "Centralizada" },
  { value: "rule-of-thirds", label: "Regra dos terços" },
  { value: "diagonal", label: "Diagonal dinâmica" },
  { value: "symmetric", label: "Simétrica" },
  { value: "negative-space", label: "Com espaço negativo p/ texto" },
] as const;

export const TEXT_RENDERER_OPTIONS = [
  {
    value: "overlay",
    label: "Tipografia do servidor (recomendado)",
    hint: "Inter real, kerning preciso, consistente com a marca",
  },
  {
    value: "model",
    label: "Pelo modelo de IA (FLUX 2)",
    hint: "Visual integrado à cena, mas pode errar acentos. Use só com Qualidade Premium.",
  },
] as const;

export const QUALITY_OPTIONS = [
  {
    value: "fast",
    label: "Rápida — FLUX schnell",
    hint: "10 créditos · ~4s · ideal para iterar conceitos",
  },
  {
    value: "premium",
    label: "Premium — FLUX 2",
    hint: "25 créditos · ~15s · fidelidade máxima, ideal para anúncios em produção",
  },
] as const;

export const TEXT_POSITION_OPTIONS = [
  { value: "none", label: "Sem preferência" },
  { value: "top", label: "Topo" },
  { value: "center", label: "Centro" },
  { value: "bottom", label: "Base" },
  { value: "left", label: "Lateral esquerda" },
  { value: "right", label: "Lateral direita" },
] as const;

const STYLE_DESC: Record<string, string> = {
  "editorial-photo": "high-end editorial photograph",
  "product-photo": "clean product photograph on a seamless surface",
  "lifestyle-photo": "lifestyle photograph capturing authentic human moments",
  cinematic: "cinematic photograph with shallow depth of field",
  minimalist: "minimalist flat design with clean shapes",
  "illustration-2d": "modern 2D vector illustration with confident line work",
  "illustration-3d": "polished 3D render with soft physical materials",
  isometric: "isometric 3D illustration with crisp edges",
};

const MOOD_DESC: Record<string, string> = {
  premium: "premium, sophisticated atmosphere",
  energetic: "energetic, vibrant atmosphere",
  calm: "calm, serene atmosphere",
  professional: "professional, trustworthy atmosphere",
  playful: "playful, youthful atmosphere",
  futuristic: "tech-forward, futuristic atmosphere",
};

const LIGHTING_DESC: Record<string, string> = {
  natural: "natural daylight",
  studio: "controlled studio lighting with soft key and fill",
  "golden-hour":
    "DRAMATIC warm golden-hour sunset light pouring in from the side, casting long shadows and a strong amber glow across the entire scene",
  dramatic: "dramatic high-contrast lighting with deep shadows",
  "soft-diffused": "soft diffused lighting with smooth gradients",
  neon: "neon and gradient color lighting in cyan and magenta tones",
  backlit: "backlit silhouette with strong rim light",
};

const PALETTE_DESC: Record<string, string> = {
  "brand-orange":
    "DOMINANT warm orange (#FF5E1A) accent color saturating the wardrobe, props, ambient light and on-screen graphics, balanced over a deep neutral base — this is a premium SaaS brand campaign",
  warm: "DOMINANT warm tones (oranges, deep reds, ambers) saturating the entire scene, balanced with neutrals",
  cool: "DOMINANT cool tones (blues, teals, indigos) saturating the entire scene, balanced with neutrals",
  neutral: "muted neutral palette of off-white, beige and charcoal",
  monochrome: "strict monochrome black and white with a single saturated accent color popping",
  vibrant: "vibrant, highly saturated colors with strong contrast and color blocking",
};

const COMPOSITION_DESC: Record<string, string> = {
  centered: "balanced centered composition with the subject in the middle",
  "rule-of-thirds":
    "STRICT rule-of-thirds composition: place the main subject clearly in the right third of the frame, leaving the left two-thirds as supporting environment",
  diagonal: "dynamic diagonal composition that leads the eye through the frame",
  symmetric: "symmetric composition with mirrored elements",
  "negative-space":
    "leave the entire bottom 35% of the frame as clean, low-contrast negative space (sky, wall or out-of-focus area) for typography overlay",
};

const NEGATIVE_SPACE_BY_POSITION: Record<string, string> = {
  top: "leave the top 30% of the frame as clean, low-contrast negative space for typography overlay",
  bottom:
    "leave the bottom 35% of the frame as clean, low-contrast negative space (floor, wall or out-of-focus area) for typography overlay",
  center: "leave a clear horizontal band across the center of the frame as low-contrast negative space for typography overlay",
  left: "leave the left third of the frame as clean, low-contrast negative space for typography overlay",
  right: "leave the right third of the frame as clean, low-contrast negative space for typography overlay",
};

export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

export interface CreativeBrief {
  theme: string;
  highlight: string;
  background?: string;
  style: string;
  mood: string;
  lighting: string;
  palette?: string;
  paletteCustom?: string;
  composition?: string;
  /** Headline. With renderer="overlay" (default), it's rendered server-side via canvas
   *  and the model is asked to leave negative space. With renderer="model", the headline
   *  text is included IN the prompt for the diffusion model to draw. */
  headline?: string;
  subheadline?: string;
  /** Where the text block sits */
  textPosition?: string;
  /** "overlay" (default) → server canvas. "model" → diffusion draws the text. */
  textRenderer?: "overlay" | "model";
  avoid?: string;
  aspectRatio: AspectRatio;
  type: "image" | "video";
}

const DEFAULT_AVOID_NO_TEXT =
  "low quality, blurry, watermarks, signatures, distorted faces, mangled hands, generic stock photo aesthetic, any rendered text, captions, letters, words or typography in the image";

const DEFAULT_AVOID_WITH_TEXT =
  "low quality, blurry, watermarks, signatures, distorted faces, mangled hands, generic stock photo aesthetic, misspelled words, garbled text, broken letters, mangled typography, translated text (do not output English when Portuguese was requested), invented words, extra captions or taglines beyond what was requested, English suffixes like 'for SMBs', white text on bright sunlit surfaces with poor contrast, faint or low-contrast typography";

// Describes each character of a phrase explicitly, calling out diacritic
// position so the diffusion model can't hallucinate cedillas or circumflexes
// onto the wrong letter (a recurring FLUX 2 quirk on Portuguese accents).
function describeDiacritics(input: string): string {
  const DIACRITIC_HINTS: Record<string, string> = {
    á: "a with acute",
    à: "a with grave",
    â: "a with circumflex",
    ã: "a with tilde, NOT n",
    é: "e with acute",
    ê: "e with circumflex, NOT n with cedilla",
    í: "i with acute",
    ó: "o with acute",
    ô: "o with circumflex",
    õ: "o with tilde",
    ú: "u with acute",
    ü: "u with diaeresis",
    ç: "c with cedilla — small comma below — NEVER on other letters",
  };
  const chars = [...input];
  const parts: string[] = [];
  for (const ch of chars) {
    if (ch === " ") {
      parts.push("/");
      continue;
    }
    const hint = DIACRITIC_HINTS[ch.toLowerCase()];
    parts.push(hint ? `${ch} (${hint})` : ch);
  }
  return `spelled: ${parts.join(" ")}`;
}

const POSITION_TO_TEXT_LOCATION: Record<string, string> = {
  top: "near the top of the frame",
  bottom: "anchored at the bottom of the frame",
  center: "centered in the frame",
  left: "aligned to the left side",
  right: "aligned to the right side",
};

// When the model is rendering text itself, ensure the chosen area is a deep
// dark surface so white type pops. These directives must come BEFORE the
// lighting block in the assembled prompt, otherwise the model commits to a
// light direction first and ignores the darkening hint.
const POSITION_DIMMING: Record<string, string> = {
  top:
    "The top third of the frame must be a deep dark surface (dark sky, dark ceiling, deep shadow or dark gradient) — keep any bright lighting away from this area.",
  bottom:
    "The bottom third of the frame must be a deep dark surface (dark floor, deep shadow, dark cloth or dark vignette) — keep any bright lighting away from this area.",
  center:
    "The center of the frame must have a soft dark scrim or naturally darkened backdrop behind the text.",
  left:
    "The entire LEFT third of the frame must be in deep shadow or dark surface (dark wall, dark curtain, dark cement, deep vignette) — DO NOT let bright light or sunlight fall on this side.",
  right:
    "The entire RIGHT third of the frame must be in deep shadow or dark surface (dark wall, dark curtain, dark cement, deep vignette) — DO NOT let bright light or sunlight fall on this side.",
};

export function buildSocialAdPrompt(brief: CreativeBrief): string {
  const styleText = STYLE_DESC[brief.style] ?? brief.style;
  const moodText = MOOD_DESC[brief.mood] ?? brief.mood;
  const lightingText = LIGHTING_DESC[brief.lighting] ?? brief.lighting;
  const compositionText = brief.composition
    ? (COMPOSITION_DESC[brief.composition] ?? brief.composition)
    : null;

  const paletteText =
    brief.palette === "custom" && brief.paletteCustom?.trim()
      ? brief.paletteCustom.trim()
      : brief.palette
        ? (PALETTE_DESC[brief.palette] ?? brief.palette)
        : null;

  const medium = brief.type === "video" ? "video frame still" : "photograph";
  const hasHeadline = Boolean(brief.headline?.trim());
  const renderer: "overlay" | "model" = brief.textRenderer ?? "overlay";
  const useModelText = hasHeadline && renderer === "model";
  const useOverlay = hasHeadline && renderer === "overlay";
  const textPosition =
    hasHeadline && brief.textPosition && brief.textPosition !== "none"
      ? brief.textPosition
      : null;
  const negSpaceText = useOverlay && textPosition
    ? NEGATIVE_SPACE_BY_POSITION[textPosition]
    : null;

  const parts: string[] = [];

  // Front-load: style + aspect + composition + palette + lighting.
  // FLUX-class models weight the first ~50 tokens heaviest.
  parts.push(
    `${brief.aspectRatio} aspect-ratio ${styleText} ${medium} for a premium social media advertisement, mobile-first viewing.`,
  );

  if (compositionText) {
    parts.push(`${compositionText.charAt(0).toUpperCase()}${compositionText.slice(1)}.`);
  }

  if (paletteText) {
    parts.push(`${paletteText}.`);
  }

  // CRITICAL ordering: the text-area darkening directive must come BEFORE the
  // lighting line. Otherwise the model commits to a light direction first and
  // refuses to darken the text region.
  if (useModelText && textPosition) {
    const dim = POSITION_DIMMING[textPosition];
    if (dim) parts.push(dim);
  }

  parts.push(`Lit by ${lightingText}.`);
  parts.push(`${moodText.charAt(0).toUpperCase()}${moodText.slice(1)}.`);

  // Text handling — two branches:
  //  (a) overlay: leave negative space, server composites Inter afterward
  //  (b) model:   ask the diffusion model itself to render the headline
  if (negSpaceText) {
    parts.push(`${negSpaceText.charAt(0).toUpperCase()}${negSpaceText.slice(1)}.`);
  } else if (useModelText) {
    const loc = textPosition
      ? (POSITION_TO_TEXT_LOCATION[textPosition] ?? "in a clearly readable area")
      : "in a clearly readable area";
    const headline = brief.headline!.trim();
    const sub = brief.subheadline?.trim();
    const headlineSpelled = describeDiacritics(headline);
    const subSpelled = sub ? describeDiacritics(sub) : null;

    let textInstr =
      `CRITICAL TYPOGRAPHY: Render Brazilian Portuguese typography directly in the image, ${loc}, in heavy bold modern sans-serif (weight 800+), tight kerning, large enough to read on a phone screen. ` +
      `${sub ? "TWO LINES REQUIRED — line 1 (large headline) AND line 2 (smaller supporting line) MUST both appear, stacked vertically. NEVER omit the second line." : "ONE LINE — just the headline."} ` +
      `\n\nLINE 1 (headline): "${headline}" — ${headlineSpelled}` +
      (subSpelled ? `\n\nLINE 2 (supporting): "${sub}" — ${subSpelled}` : "") +
      `\n\nDIACRITIC RULES (CRITICAL): ` +
      `circumflex (^) ONLY on the marked vowel ('ê' = e + circumflex; nothing else carries it). ` +
      `Tilde (~) ONLY on 'ã' or 'õ' — never on consonants. ` +
      `Acute (´) ONLY on the marked vowel ('á', 'é', 'í', 'ó', 'ú'). ` +
      `Cedilla (,) ONLY on 'ç' (lowercase c with comma below) — NEVER place a cedilla under n, m, e, i, t, or any other letter. ` +
      `If the original word does not have a diacritic on a given letter, render that letter PLAIN with no marks. ` +
      `\n\nLANGUAGE RULES: DO NOT translate to English. DO NOT paraphrase. DO NOT invent extra captions, taglines, or English suffixes (no "for SMBs", no "Sales", no period-suffixed phrases). Both lines stay in Brazilian Portuguese exactly as written. ` +
      `\n\nCONTRAST RULES: choose ONE color strategy — WHITE type on a deep dark surface (shadow, dark wall, dark cement, dark cloth, dark wood, dark vignette) OR DEEP CHARCOAL (#0A0A0B) type on a bright/sunlit surface. Pick whichever yields the higher contrast given the actual lighting in the chosen region. Never render faint white type on light/cement/sunlit areas.`;
    parts.push(textInstr);
  }

  // Now the descriptive content.
  if (brief.theme.trim()) {
    parts.push(`Concept: ${brief.theme.trim()}.`);
  }

  parts.push(`Subject: ${brief.highlight.trim()}.`);

  if (brief.background?.trim()) {
    parts.push(`Setting: ${brief.background.trim()}.`);
  }

  // Quality boilerplate. The "no text" suffix only applies when the model is
  // NOT being asked to render typography itself.
  const qualityLine = useModelText
    ? "Sharp focus, ultra-high resolution, premium commercial quality, scroll-stopping. Strong focal point that reads instantly even at thumbnail size."
    : "Sharp focus, ultra-high resolution, premium commercial quality, scroll-stopping. Strong focal point that reads instantly even at thumbnail size. No text, no captions, no letters in the image.";
  parts.push(qualityLine);

  const baseAvoid = useModelText ? DEFAULT_AVOID_WITH_TEXT : DEFAULT_AVOID_NO_TEXT;
  const avoidText = brief.avoid?.trim()
    ? `${brief.avoid.trim()}, ${baseAvoid}`
    : baseAvoid;
  parts.push(`Avoid: ${avoidText}.`);

  return parts.join(" ");
}

export const FORMAT_TO_ASPECT: Record<string, AspectRatio> = {
  "1x1": "1:1",
  "4x5": "4:5",
  "9x16": "9:16",
  "16x9": "16:9",
};
