"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * Scroll-driven animation engine + mouse interaction primitives.
 *
 * Philosophy:
 * - Scroll animations are SCRUBBED — driven by element progress through the
 *   viewport (0 to 1). Reversing scroll naturally reverses the animation.
 *   No "entered viewport / left viewport" toggles, no on/off jumps.
 * - All scroll callbacks share a single rAF loop (one listener, many subs).
 * - Mouse hooks (parallax, spotlight, tilt) attach their own listeners.
 * - All hooks bail out under `prefers-reduced-motion: reduce`.
 */

// ───────────────────────────────────────────────────────────── reduced motion ──

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─────────────────────────────────────────────────────────── scroll engine ──

type ScrollSubscriber = () => void;
const subscribers = new Set<ScrollSubscriber>();
let engineStarted = false;
let pendingFrame = false;

function tickAll() {
  pendingFrame = false;
  subscribers.forEach((fn) => fn());
}

function onScrollOrResize() {
  if (pendingFrame) return;
  pendingFrame = true;
  requestAnimationFrame(tickAll);
}

function startEngine() {
  if (engineStarted || typeof window === "undefined") return;
  engineStarted = true;
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
}

function subscribe(fn: ScrollSubscriber): () => void {
  if (typeof window === "undefined") return () => {};
  startEngine();
  subscribers.add(fn);
  fn();
  return () => {
    subscribers.delete(fn);
  };
}

// ───────────────────────────────────────────────────────────── easing + math ──

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Compute scene progress 0..1 for an element.
 * - `startVp` = 0..1 viewport position where progress = 0 (default 1.0 = bottom)
 * - `endVp`   = 0..1 viewport position where progress = 1 (default 0.4)
 * - `anchor`  = which point of the element to track
 */
function elementProgress(
  rect: DOMRect,
  vh: number,
  startVp: number,
  endVp: number,
  anchor: "top" | "center" | "bottom",
): number {
  const elY =
    anchor === "top"
      ? rect.top
      : anchor === "bottom"
        ? rect.bottom
        : rect.top + rect.height / 2;
  const startY = startVp * vh;
  const endY = endVp * vh;
  if (startY === endY) return elY <= startY ? 1 : 0;
  return clamp01((startY - elY) / (startY - endY));
}

// ─────────────────────────────────────────────────────────── scrubbed types ──

type Range2 = [number, number];

interface SceneOptions {
  /** viewport position (0=top, 1=bottom) where progress = 0. Default 1.0 */
  startVp?: number;
  /** viewport position where progress = 1. Default 0.4 */
  endVp?: number;
  /** anchor point of the element. Default "top" */
  anchor?: "top" | "center" | "bottom";
  /** sub-range of scene progress where this animation runs. Default [0, 1] */
  range?: Range2;
  /** easing function. Default easeOutCubic */
  ease?: (t: number) => number;
}

interface ScrollAnimateProps extends SceneOptions {
  translateX?: Range2;
  translateY?: Range2;
  scale?: Range2;
  /** rotate around Z axis (degrees) */
  rotate?: Range2;
  /** rotate around X axis (3D, degrees) */
  rotateX?: Range2;
  /** rotate around Y axis (3D, degrees) */
  rotateY?: Range2;
  /** perspective applied to 3D rotations (px). Default 1200 */
  perspective?: number;
  opacity?: Range2;
  /** blur in px */
  blur?: Range2;
}

// ─────────────────────────────────────────────────── useScrollAnimate (core) ──

/**
 * Declarative scrubbed animation. Each property is a [from, to] tuple that
 * interpolates with scroll progress. When you scroll back, it reverses.
 *
 * Example:
 *   const ref = useScrollAnimate<HTMLDivElement>({
 *     translateY: [80, 0],
 *     scale: [0.92, 1],
 *     opacity: [0, 1],
 *     range: [0, 0.6],
 *   });
 */
export function useScrollAnimate<T extends HTMLElement>(props: ScrollAnimateProps) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // Snap to "to" values
      const p = propsRef.current;
      if (p.opacity) el.style.opacity = String(p.opacity[1]);
      if (p.blur) el.style.filter = `blur(${p.blur[1]}px)`;
      return;
    }

    el.style.willChange = "transform, opacity, filter";

    const apply = () => {
      const p = propsRef.current;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.4,
        p.anchor ?? "top",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const t = clamp01((sceneP - r0) / (r1 - r0));
      const e = (p.ease ?? easeOutCubic)(t);

      const transforms: string[] = [];
      if (p.perspective || p.rotateX || p.rotateY) {
        transforms.push(`perspective(${p.perspective ?? 1200}px)`);
      }
      if (p.translateX) {
        transforms.push(`translateX(${lerp(p.translateX[0], p.translateX[1], e)}px)`);
      }
      if (p.translateY) {
        transforms.push(`translateY(${lerp(p.translateY[0], p.translateY[1], e)}px)`);
      }
      if (p.rotate) {
        transforms.push(`rotate(${lerp(p.rotate[0], p.rotate[1], e)}deg)`);
      }
      if (p.rotateX) {
        transforms.push(`rotateX(${lerp(p.rotateX[0], p.rotateX[1], e)}deg)`);
      }
      if (p.rotateY) {
        transforms.push(`rotateY(${lerp(p.rotateY[0], p.rotateY[1], e)}deg)`);
      }
      if (p.scale) {
        transforms.push(`scale(${lerp(p.scale[0], p.scale[1], e)})`);
      }
      if (transforms.length) el.style.transform = transforms.join(" ");

      if (p.opacity) {
        el.style.opacity = String(lerp(p.opacity[0], p.opacity[1], e));
      }
      if (p.blur) {
        el.style.filter = `blur(${lerp(p.blur[0], p.blur[1], e)}px)`;
      }
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ─────────────────────────────────────────────────────── scrubbed word reveal ──

interface ScrollWordRevealProps extends SceneOptions {
  /** distance words travel from below (px). Default 30 */
  distance?: number;
  /** how much of the scene each word's animation occupies (0..1). Default 0.35 */
  windowSize?: number;
  /** rotation kick per word (deg). Default 5 */
  rotate?: number;
}

/**
 * Reveal text word-by-word, each tied to a sliding window of scene progress.
 * Wraps every word in a span and applies opacity + translateY + rotateX
 * proportional to its individual progress slice. Reverses on scroll up.
 */
export function useScrollWordReveal<T extends HTMLElement>(
  props: ScrollWordRevealProps = {},
) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Wrap words once (idempotent)
    if (root.dataset.wordsReady !== "1") {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const t = n as Text;
        if (t.nodeValue && t.nodeValue.trim().length > 0) textNodes.push(t);
      }
      for (const node of textNodes) {
        const text = node.nodeValue ?? "";
        const frag = document.createDocumentFragment();
        const tokens = text.split(/(\s+)/);
        for (const tok of tokens) {
          if (/^\s+$/.test(tok)) {
            frag.appendChild(document.createTextNode(tok));
          } else if (tok.length) {
            const outer = document.createElement("span");
            outer.style.display = "inline-block";
            outer.style.overflow = "hidden";
            outer.style.verticalAlign = "top";
            const inner = document.createElement("span");
            inner.style.display = "inline-block";
            inner.style.willChange = "transform, opacity";
            inner.dataset.word = "1";
            inner.textContent = tok;
            outer.appendChild(inner);
            frag.appendChild(outer);
          }
        }
        node.parentNode?.replaceChild(frag, node);
      }
      root.dataset.wordsReady = "1";
    }

    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    if (words.length === 0) return;

    if (prefersReducedMotion()) {
      for (const w of words) {
        w.style.opacity = "1";
        w.style.transform = "none";
      }
      return;
    }

    for (const w of words) w.style.willChange = "transform, opacity";

    const apply = () => {
      const p = propsRef.current;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.55,
        p.anchor ?? "top",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const localP = clamp01((sceneP - r0) / (r1 - r0));
      const ease = p.ease ?? easeOutQuart;
      const distance = p.distance ?? 30;
      const rotate = p.rotate ?? 5;
      const win = p.windowSize ?? 0.35;
      const lastStart = 1 - win;

      for (let i = 0; i < words.length; i++) {
        const start = (i / words.length) * lastStart;
        const t = ease(clamp01((localP - start) / win));
        const ty = lerp(distance, 0, t);
        const rot = lerp(rotate, 0, t);
        const op = t;
        words[i].style.transform = `translateY(${ty}px) rotate(${rot}deg)`;
        words[i].style.opacity = String(op);
      }
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ────────────────────────────────────────────────────────── scrubbed children ──

interface ScrollStaggerProps extends SceneOptions {
  /** child selector. Default "[data-stagger]" */
  selector?: string;
  /** how much of the scene each child's animation occupies. Default 0.45 */
  windowSize?: number;
  translateY?: Range2;
  translateX?: Range2;
  scale?: Range2;
  rotate?: Range2;
  opacity?: Range2;
}

/**
 * Stagger children declaratively, each child tied to a sliding window of the
 * parent's scene progress. Reverses on scroll up.
 */
export function useScrollStagger<T extends HTMLElement>(
  props: ScrollStaggerProps = {},
) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>(propsRef.current.selector ?? "[data-stagger]"),
    );
    if (items.length === 0) return;

    if (prefersReducedMotion()) {
      for (const it of items) {
        it.style.opacity = "1";
        it.style.transform = "none";
      }
      return;
    }

    for (const it of items) it.style.willChange = "transform, opacity";

    const apply = () => {
      const p = propsRef.current;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.5,
        p.anchor ?? "top",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const localP = clamp01((sceneP - r0) / (r1 - r0));
      const ease = p.ease ?? easeOutCubic;
      const win = p.windowSize ?? 0.45;
      const lastStart = 1 - win;

      for (let i = 0; i < items.length; i++) {
        const start = (i / Math.max(items.length - 1, 1)) * lastStart;
        const t = ease(clamp01((localP - start) / win));
        const transforms: string[] = [];
        if (p.translateX) transforms.push(`translateX(${lerp(p.translateX[0], p.translateX[1], t)}px)`);
        if (p.translateY) transforms.push(`translateY(${lerp(p.translateY[0], p.translateY[1], t)}px)`);
        if (p.rotate) transforms.push(`rotate(${lerp(p.rotate[0], p.rotate[1], t)}deg)`);
        if (p.scale) transforms.push(`scale(${lerp(p.scale[0], p.scale[1], t)})`);
        items[i].style.transform = transforms.join(" ");
        if (p.opacity) items[i].style.opacity = String(lerp(p.opacity[0], p.opacity[1], t));
      }
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ─────────────────────────────────────────────────────── scrubbed clip reveal ──

interface ScrollClipRevealProps extends SceneOptions {
  /** direction the mask uncovers from. Default "left" */
  from?: "left" | "right" | "top" | "bottom";
}

/**
 * Reveal an element via clip-path inset. Mask shrinks from one edge as scroll
 * progresses. Great for image / card reveals.
 */
export function useScrollClipReveal<T extends HTMLElement>(
  props: ScrollClipRevealProps = {},
) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.clipPath = "inset(0)";
      return;
    }

    el.style.willChange = "clip-path";
    el.style.clipPath = "inset(0 100% 0 0)";

    const apply = () => {
      const p = propsRef.current;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.45,
        p.anchor ?? "top",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const t = (p.ease ?? easeInOutCubic)(clamp01((sceneP - r0) / (r1 - r0)));
      const remain = 100 - t * 100;
      const from = p.from ?? "left";
      let inset = "0";
      if (from === "left") inset = `0 ${remain}% 0 0`;
      else if (from === "right") inset = `0 0 0 ${remain}%`;
      else if (from === "top") inset = `0 0 ${remain}% 0`;
      else inset = `${remain}% 0 0 0`;
      el.style.clipPath = `inset(${inset})`;
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ─────────────────────────────────────────────────────────── scrubbed counter ──

interface ScrollCountProps extends SceneOptions {
  from?: number;
  to: number;
  format?: (v: number) => string;
}

/**
 * Numeric counter scrubbed to scroll progress. Counts up as you scroll into
 * the element, counts down as you scroll back up.
 */
export function useScrollCount<T extends HTMLElement>(props: ScrollCountProps) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (v: number) =>
      propsRef.current.format ? propsRef.current.format(v) : String(Math.round(v));

    if (prefersReducedMotion()) {
      el.textContent = fmt(propsRef.current.to);
      return;
    }

    const apply = () => {
      const p = propsRef.current;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.5,
        p.anchor ?? "center",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const t = (p.ease ?? easeOutCubic)(clamp01((sceneP - r0) / (r1 - r0)));
      // Always round to integer before formatting. Counters with fractional
      // targets (e.g. ROAS 4.1x stored as 41 then divided in format) keep
      // working because the format function does the math on the integer.
      const value = Math.round(lerp(p.from ?? 0, p.to, t));
      el.textContent = fmt(value);
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ────────────────────────────────────────────────────────── scrubbed bars ──

interface ScrollBarsProps extends SceneOptions {
  selector?: string;
  windowSize?: number;
}

/**
 * Animate `[data-bar]` width from 0% to `data-target`% scrubbed to scroll.
 */
export function useScrollBars<T extends HTMLElement>(props: ScrollBarsProps = {}) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(propsRef.current.selector ?? "[data-bar]"),
    );
    if (items.length === 0) return;
    const targets = items.map((el) => parseFloat(el.dataset.target ?? "0"));

    if (prefersReducedMotion()) {
      items.forEach((el, i) => {
        el.style.width = `${targets[i]}%`;
      });
      return;
    }

    items.forEach((el) => {
      el.style.width = "0%";
    });

    const apply = () => {
      const p = propsRef.current;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.5,
        p.anchor ?? "top",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const localP = clamp01((sceneP - r0) / (r1 - r0));
      const ease = p.ease ?? easeOutCubic;
      const win = p.windowSize ?? 0.5;
      const lastStart = 1 - win;
      for (let i = 0; i < items.length; i++) {
        const start = (i / Math.max(items.length - 1, 1)) * lastStart;
        const t = ease(clamp01((localP - start) / win));
        items[i].style.width = `${targets[i] * t}%`;
      }
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ────────────────────────────────────────────────────── scrubbed SVG draw path ──

/**
 * Draw an SVG path scrubbed to scroll progress.
 */
export function useScrollDrawPath<T extends SVGPathElement>(props: SceneOptions = {}) {
  const ref = useRef<T | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let length = 0;
    try {
      length = el.getTotalLength();
    } catch {
      return;
    }
    if (length === 0) return;

    if (prefersReducedMotion()) {
      el.style.strokeDasharray = "none";
      el.style.strokeDashoffset = "0";
      return;
    }

    el.style.strokeDasharray = String(length);

    const apply = () => {
      const p = propsRef.current;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const sceneP = elementProgress(
        rect,
        vh,
        p.startVp ?? 1.0,
        p.endVp ?? 0.45,
        p.anchor ?? "top",
      );
      const [r0, r1] = p.range ?? [0, 1];
      const t = (p.ease ?? easeOutCubic)(clamp01((sceneP - r0) / (r1 - r0)));
      el.style.strokeDashoffset = String(length * (1 - t));
    };

    return subscribe(apply);
  }, []);

  return ref;
}

// ───────────────────────────────────────────────────────────── mouse parallax ──

/**
 * Element follows the cursor with a strength factor. Cursor at center → no
 * offset. Cursor at edge → ±strength px. Use multiple layers with different
 * strengths for depth.
 */
export function useMouseParallax<T extends HTMLElement>(
  options: {
    strength?: number;
    /** apply X axis only? Default false */
    xOnly?: boolean;
    /** apply Y axis only? Default false */
    yOnly?: boolean;
    /** scope to viewport (true) or element rect (false). Default true */
    scopeViewport?: boolean;
    /** invert direction (move opposite to cursor). Default false */
    invert?: boolean;
  } = {},
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const {
      strength = 30,
      xOnly = false,
      yOnly = false,
      scopeViewport = true,
      invert = false,
    } = options;

    let raf = 0;
    let pending = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const dir = invert ? -1 : 1;

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      if (Math.abs(currentX - targetX) > 0.05 || Math.abs(currentY - targetY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        pending = false;
      }
    };

    const onMove = (e: MouseEvent) => {
      let dx: number;
      let dy: number;
      if (scopeViewport) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        dx = (e.clientX - cx) / cx;
        dy = (e.clientY - cy) / cy;
      } else {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        dx = (e.clientX - cx) / (rect.width / 2);
        dy = (e.clientY - cy) / (rect.height / 2);
      }
      targetX = yOnly ? 0 : dx * strength * dir;
      targetY = xOnly ? 0 : dy * strength * dir;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [options.strength, options.xOnly, options.yOnly, options.scopeViewport, options.invert]);

  return ref;
}

// ─────────────────────────────────────────────────────────────── mouse tilt ──

/**
 * 3D tilt that follows the cursor. Use on cards, mocks, photos.
 */
export function useMouseTilt<T extends HTMLElement>(
  options: { max?: number; perspective?: number; scale?: number } = {},
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const { max = 8, perspective = 1200, scale = 1.0 } = options;

    el.style.transformStyle = "preserve-3d";
    el.style.willChange = "transform";

    let raf = 0;
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;
    let targetScale = 1;
    let currentScale = 1;
    let active = false;

    const tick = () => {
      currentRX = lerp(currentRX, targetRX, 0.12);
      currentRY = lerp(currentRY, targetRY, 0.12);
      currentScale = lerp(currentScale, targetScale, 0.12);
      el.style.transform = `perspective(${perspective}px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) scale(${currentScale})`;
      if (
        Math.abs(currentRX - targetRX) > 0.01 ||
        Math.abs(currentRY - targetRY) > 0.01 ||
        Math.abs(currentScale - targetScale) > 0.001
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        active = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      targetRY = (px - 0.5) * 2 * max;
      targetRX = (0.5 - py) * 2 * max;
      targetScale = scale;
      if (!active) {
        active = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      targetRX = 0;
      targetRY = 0;
      targetScale = 1;
      if (!active) {
        active = true;
        raf = requestAnimationFrame(tick);
      }
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [options.max, options.perspective, options.scale]);

  return ref;
}

// ─────────────────────────────────────────────────────────── mouse spotlight ──

/**
 * Apply a radial gradient that follows the cursor over the element. Pure CSS
 * variable so the consumer can compose it (e.g., as background or pseudo).
 * Sets `--spot-x`, `--spot-y` (in px relative to element).
 */
export function useMouseSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      el.style.setProperty("--spot-active", "1");
    };
    const onLeave = () => {
      el.style.setProperty("--spot-active", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}

// ──────────────────────────────────────────────────────────── magnetic hover ──

/**
 * Magnetic CTA: element drifts toward cursor while hovered.
 */
export function useMagnetic<T extends HTMLElement>(
  options: { strength?: number; duration?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const { strength = 22, duration = 480 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      animate(el, {
        translateX: dx * strength,
        translateY: dy * strength,
        duration: 280,
        ease: "outQuad",
      });
    };

    const onLeave = () => {
      animate(el, {
        translateX: 0,
        translateY: 0,
        duration,
        ease: "outElastic(1, .55)",
      });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, duration]);

  return ref;
}

// ─────────────────────────────────────────────────────────────── float (idle) ──

/**
 * Idle floating loop. For badges, icons, decorative orbs.
 */
export function useFloat<T extends HTMLElement>(
  options: { distance?: number; duration?: number; delay?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const { distance = 8, duration = 4200, delay = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const a = animate(el, {
      translateY: [
        { to: -distance, ease: "inOutSine", duration: duration / 2 },
        { to: 0, ease: "inOutSine", duration: duration / 2 },
      ],
      loop: true,
      delay,
    });
    return () => {
      a.pause();
    };
  }, [distance, duration, delay]);

  return ref;
}

// ───────────────────────────────────────────────────────── slide-down on mount ──

export function useSlideDownOnMount<T extends HTMLElement>(
  options: { delay?: number; duration?: number; distance?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const { delay = 0, duration = 800, distance = 32 } = options;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    el.style.opacity = "0";
    el.style.transform = `translateY(-${distance}px)`;
    el.style.willChange = "transform, opacity";
    animate(el, {
      opacity: [0, 1],
      translateY: [-distance, 0],
      duration,
      delay,
      ease: "outExpo",
    });
  }, [delay, duration, distance]);

  return ref;
}

// ────────────────────────────────────────────────────────────────── accordion ──

export function useAccordion<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const inner = root.querySelector<HTMLElement>("[data-collapsible]");
    if (!inner) return;
    if (prefersReducedMotion()) {
      inner.style.height = open ? "auto" : "0px";
      inner.style.opacity = open ? "1" : "0";
      inner.style.overflow = "hidden";
      return;
    }
    inner.style.overflow = "hidden";
    inner.style.willChange = "height, opacity";
    const target = inner.scrollHeight;
    if (open) {
      animate(inner, {
        height: [0, target],
        opacity: [0, 1],
        duration: 520,
        ease: "outExpo",
        onComplete: () => {
          inner.style.height = "auto";
        },
      });
    } else {
      const current = inner.getBoundingClientRect().height;
      inner.style.height = `${current}px`;
      animate(inner, {
        height: [current, 0],
        opacity: [1, 0],
        duration: 380,
        ease: "outQuad",
      });
    }
  }, [open]);

  return ref;
}

// ─────────────────────────────────────────────────────────────────── crossfade ──

/**
 * Re-trigger fade-up on key change (tab switching).
 */
export function useCrossfade<T extends HTMLElement>(
  key: string | number,
  options: { distance?: number; duration?: number } = {},
) {
  const ref = useRef<T | null>(null);
  const { distance = 12, duration = 550 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    animate(el, {
      opacity: [0, 1],
      translateY: [distance, 0],
      duration,
      ease: "outExpo",
    });
  }, [key, distance, duration]);

  return ref;
}

// ─────────────────────────────────────────────────── back-compat aliases ──
//
// The following aliases preserve the old hook names used elsewhere in the
// codebase, mapping them to the new scrubbed engine. New code should use
// `useScrollAnimate`, `useScrollStagger`, `useScrollWordReveal`, etc.

export function useFadeUpOnScroll<T extends HTMLElement>(
  options: { delay?: number; distance?: number; duration?: number } = {},
) {
  const distance = options.distance ?? 60;
  return useScrollAnimate<T>({
    translateY: [distance, 0],
    opacity: [0, 1],
    range: [0, 0.7],
  });
}

export function useStaggerOnScroll<T extends HTMLElement>(
  options: {
    selector?: string;
    delay?: number;
    staggerMs?: number;
    distance?: number;
    duration?: number;
    threshold?: number;
  } = {},
) {
  const distance = options.distance ?? 50;
  return useScrollStagger<T>({
    selector: options.selector,
    translateY: [distance, 0],
    opacity: [0, 1],
    windowSize: 0.5,
  });
}

export function useFadeInOnScroll<T extends HTMLElement>(
  options: {
    selector?: string;
    staggerMs?: number;
    duration?: number;
    delay?: number;
    threshold?: number;
  } = {},
) {
  return useScrollStagger<T>({
    selector: options.selector ?? "[data-fade-in]",
    opacity: [0, 1],
    windowSize: 0.5,
  });
}

export function useCountUp<T extends HTMLElement>(
  target: number,
  options: { from?: number; duration?: number; delay?: number; format?: (v: number) => string } = {},
) {
  return useScrollCount<T>({
    from: options.from ?? 0,
    to: target,
    format: options.format,
  });
}

export function useDrawPath<T extends SVGPathElement>(options: { duration?: number; delay?: number } = {}) {
  return useScrollDrawPath<T>({});
}

export function useAnimateBars<T extends HTMLElement>(
  options: { selector?: string; duration?: number; staggerMs?: number; delay?: number } = {},
) {
  return useScrollBars<T>({ selector: options.selector });
}

export function useScaleInOnScroll<T extends HTMLElement>(
  options: { delay?: number; duration?: number; distance?: number; from?: number } = {},
) {
  const distance = options.distance ?? 40;
  const from = options.from ?? 0.92;
  return useScrollAnimate<T>({
    translateY: [distance, 0],
    scale: [from, 1],
    opacity: [0, 1],
    range: [0, 0.7],
  });
}

export function useSlideInOnScroll<T extends HTMLElement>(
  options: { from?: "left" | "right"; distance?: number; duration?: number; delay?: number } = {},
) {
  const sign = options.from === "right" ? 1 : -1;
  const distance = options.distance ?? 80;
  return useScrollAnimate<T>({
    translateX: [sign * distance, 0],
    opacity: [0, 1],
    range: [0, 0.7],
  });
}

export function useTilt<T extends HTMLElement>(
  options: { max?: number; perspective?: number } = {},
) {
  return useMouseTilt<T>({ max: options.max, perspective: options.perspective });
}

export function useParallax<T extends HTMLElement>(options: { speed?: number } = {}) {
  const ref = useRef<T | null>(null);
  const { speed = 0.18 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const baseTop = el.getBoundingClientRect().top + window.scrollY;
    const apply = () => {
      const offset = (window.scrollY - baseTop) * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    return subscribe(apply);
  }, [speed]);

  return ref;
}

export function useWordReveal<T extends HTMLElement>(
  options: {
    delay?: number;
    staggerMs?: number;
    duration?: number;
    distance?: number;
    threshold?: number;
  } = {},
) {
  return useScrollWordReveal<T>({
    distance: options.distance ?? 30,
    windowSize: 0.4,
  });
}
