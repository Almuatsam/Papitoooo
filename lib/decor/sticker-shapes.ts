/**
 * Shared SVG-path helpers for lib/decor/stickers.tsx. Split out because
 * stickers.tsx is already a large flat registry — these are the reusable
 * generators, not the registry itself.
 *
 * "Hand-made" imperfection (goal: stickers that read as cut/drawn, not
 * generated) is always seeded, never `Math.random()` — these SVGs are built
 * once at module load, but a stable seed keeps a given sticker's shape
 * reproducible and makes the jitter a deliberate design choice, not noise.
 */

import { mulberry32 } from "@/lib/decor/seed";

export function wrap(inner: string, vb = "0 0 64 64"): string {
  // Explicit width/height (not just viewBox) so the browser has an
  // unambiguous intrinsic size the moment the image decodes — some engines
  // fall back to a 300x150 default for viewBox-only SVGs used as <img> src,
  // which throws off Fabric's placement/caching of the sticker.
  const [, , w, h] = vb.split(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${inner}</svg>`;
}

export function outlined(shape: string, extraAttrs = ""): string {
  return `<g stroke="#101014" stroke-width="2.5" stroke-linejoin="round" ${extraAttrs}>${shape}</g>`;
}

/** Slightly imperfect heart: seeded asymmetry between the two lobes. */
export function heartPath(cx: number, cy: number, s: number, seed?: number): string {
  const rand = seed !== undefined ? mulberry32(seed) : null;
  const leftBulge = rand ? s * (0.9 + rand() * 0.2) : s;
  const rightBulge = rand ? s * (0.9 + rand() * 0.2) : s;
  return `M${cx} ${cy + s * 0.34} C${cx - leftBulge} ${cy - s * 0.5} ${cx - s * 0.4} ${cy - s * 1.15} ${cx} ${cy - s * 0.42} C${cx + s * 0.4} ${cy - s * 1.15} ${cx + rightBulge} ${cy - s * 0.5} ${cx} ${cy + s * 0.34} Z`;
}

/** Slightly imperfect star: seeded per-point radius jitter, hand-cut rather than mathematically perfect. */
export function starPath(cx: number, cy: number, rOuter: number, rInner: number, points = 5, seed?: number): string {
  const step = Math.PI / points;
  const rand = seed !== undefined ? mulberry32(seed) : null;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    let r = i % 2 === 0 ? rOuter : rInner;
    if (rand) r *= 0.92 + rand() * 0.16;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}Z`;
}

export function badge(fill: string, emoji: string, ring = "#101014"): string {
  return wrap(
    `<circle cx="32" cy="32" r="28" fill="${fill}" stroke="${ring}" stroke-width="3"/>` +
      `<text x="32" y="43" font-size="30" text-anchor="middle" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${emoji}</text>`,
  );
}

/** Wraps SVG markup in a small deterministic rotation so a sticker isn't perfectly upright. */
export function roughRotate(inner: string, seed: number, maxDeg = 5, cx = 32, cy = 32): string {
  const rand = mulberry32(seed);
  const deg = (rand() * 2 - 1) * maxDeg;
  return `<g transform="rotate(${deg.toFixed(1)} ${cx} ${cy})">${inner}</g>`;
}

/** A hand-doodled curved arrow with an open arrowhead. */
export function arrowPath(seed: number): string {
  const rand = mulberry32(seed);
  const wobble = (rand() - 0.5) * 4;
  return (
    `<path d="M8 ${44 + wobble} Q ${20 + wobble} 12 ${52} 18" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M40 10 L54 16 L46 28" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** A wavy hand-drawn underline/swoop mark. */
export function underlinePath(seed: number): string {
  const rand = mulberry32(seed);
  const amp = 5 + rand() * 3;
  return `<path d="M6 ${34 + amp} Q 18 ${34 - amp} 32 ${34 + amp} T 58 ${34 + amp}" fill="none" stroke="#101014" stroke-width="3.5" stroke-linecap="round"/>`;
}

/** Three short wavy lines standing in for handwritten text, on a small flag/tag shape. */
export function handwrittenNoteShape(fill: string, seed: number): string {
  const rand = mulberry32(seed);
  const tilt = (rand() - 0.5) * 6;
  const lines = [22, 32, 42]
    .map((y, i) => {
      const w = 34 - i * 6 + rand() * 6;
      return `<path d="M12 ${y} q ${w / 2} -4 ${w} 0" fill="none" stroke="#101014" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>`;
    })
    .join("");
  return `<g transform="rotate(${tilt.toFixed(1)} 32 32)"><rect x="6" y="10" width="52" height="40" rx="2" fill="${fill}" stroke="#101014" stroke-width="2.5"/>${lines}</g>`;
}

/** A single faceted gem outline — the building block for rhinestone/crystal clusters (lib/decor/sticker-materials.ts). */
export function gemPolygonPath(cx: number, cy: number, r: number, seed: number): string {
  const rand = mulberry32(seed);
  const sides = 5 + Math.floor(rand() * 2);
  const rotation = rand() * Math.PI * 2;
  let d = "";
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const jitter = 0.8 + rand() * 0.32;
    const x = cx + Math.cos(angle) * r * jitter;
    const y = cy + Math.sin(angle) * r * jitter;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}Z`;
}

/** Bezier-curved organic blob outline — a rounder paper-cutout silhouette than a jittered straight-edged polygon. */
export function organicBlobPath(cx: number, cy: number, size: number, seed: number): string {
  const rand = mulberry32(seed);
  const points = 6;
  const base = size * 0.4;
  const radii = Array.from({ length: points }, () => base * (0.75 + rand() * 0.5));
  let d = "";
  for (let i = 0; i <= points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const r = radii[i % points];
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      d += `M${x.toFixed(1)} ${y.toFixed(1)} `;
    } else {
      const prevAngle = (Math.PI * 2 * (i - 1)) / points;
      const prevR = radii[(i - 1) % points];
      const c1x = cx + Math.cos(prevAngle + 0.3) * prevR * 1.15;
      const c1y = cy + Math.sin(prevAngle + 0.3) * prevR * 1.15;
      const c2x = cx + Math.cos(angle - 0.3) * r * 1.15;
      const c2y = cy + Math.sin(angle - 0.3) * r * 1.15;
      d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  }
  return `${d}Z`;
}

/** Five independently-jittered petals — a wobbly hand-cut flower, not a perfect radial pattern. */
export function flowerPetalsSvg(cx: number, cy: number, size: number, fill: string, seed: number): string {
  const rand = mulberry32(seed);
  let out = "";
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 + rand() * 0.15;
    const px = cx + Math.cos(angle) * size * 0.26;
    const py = cy + Math.sin(angle) * size * 0.26;
    const rx = size * 0.2 * (0.85 + rand() * 0.3);
    const ry = size * 0.14;
    out += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${fill}" transform="rotate(${((angle * 180) / Math.PI).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
  }
  return out;
}

/** An irregular blobby chrome shape with a specular highlight — distinct from a plain chrome circle. */
export function chromeBlobPath(fill: string, seed: number): string {
  const rand = mulberry32(seed);
  const cx = 32;
  const cy = 32;
  const sides = 7;
  const r = 24;
  let d = "";
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const jitter = 0.78 + rand() * 0.4;
    const x = cx + Math.cos(angle) * r * jitter;
    const y = cy + Math.sin(angle) * r * jitter;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  d += "Z";
  return (
    `<path d="${d}" fill="${fill}" stroke="#101014" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<ellipse cx="${cx - 7}" cy="${cy - 8}" rx="8" ry="4" fill="#ffffff" opacity="0.75" transform="rotate(-20 ${cx - 7} ${cy - 8})"/>`
  );
}
