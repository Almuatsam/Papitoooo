/**
 * Physical "finish" for stickers — the SVG-string counterpart to
 * lib/decor/piece-materials.ts. Stickers must stay portable
 * `data:image/svg+xml` strings (used both as `<img>` tray previews and as
 * Fabric image sources), so this can't literally share code with the
 * canvas-based piece finishes — it mirrors the same material vocabulary
 * (chrome, holographic, puffy, glitter, rhinestone, paper-cutout, plastic)
 * using SVG gradients, clip-paths, and a light drop-shadow filter instead.
 *
 * All irregularity is seeded (lib/decor/seed.ts), never `Math.random()`.
 */

import { gemPolygonPath } from "@/lib/decor/sticker-shapes";
import { mulberry32 } from "@/lib/decor/seed";

let uid = 0;
function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}${uid}`;
}

/** Banded metallic gradient + a small specular highlight — echoes the app's own chrome-text treatment. */
export function chromeFinish(pathD: string, seed: number): string {
  const id = nextId("chrome");
  const rand = mulberry32(seed);
  const hx = 20 + rand() * 10;
  const hy = 16 + rand() * 8;
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="#ffffff"/><stop offset="22%" stop-color="#dcdce2"/>` +
    `<stop offset="46%" stop-color="#8a8a92"/><stop offset="54%" stop-color="#fcfcfd"/>` +
    `<stop offset="74%" stop-color="#a4a4ae"/><stop offset="100%" stop-color="#f2f2f5"/>` +
    `</linearGradient></defs>` +
    `<path d="${pathD}" fill="url(#${id})" stroke="#101014" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="9" ry="4.5" fill="#ffffff" opacity="0.8" transform="rotate(-18 ${hx.toFixed(1)} ${hy.toFixed(1)})"/>`
  );
}

/** Narrow pastel iridescent sweep + a couple of thin foil-fleck reflections — restrained, not a rainbow gem. */
export function holographicFinish(pathD: string, seed: number): string {
  const id = nextId("holo");
  const rand = mulberry32(seed);
  let flecks = "";
  for (let i = 0; i < 3; i++) {
    const x = 8 + rand() * 44;
    const y = 8 + rand() * 44;
    const rot = rand() * 40 - 20;
    flecks += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="10" height="1.6" fill="#ffffff" opacity="0.55" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return (
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#ff8fc8"/><stop offset="35%" stop-color="#a8d8ff"/>` +
    `<stop offset="65%" stop-color="#ffd43c"/><stop offset="100%" stop-color="#ff8fc8"/>` +
    `</linearGradient></defs>` +
    `<path d="${pathD}" fill="url(#${id})" stroke="#101014" stroke-width="2.2" stroke-linejoin="round" opacity="0.92"/>${flecks}`
  );
}

/** Offset darker duplicate underneath + a soft highlight — fakes a raised, inflated puffy-sticker edge. */
export function puffyFinish(pathD: string, fill: string, seed: number): string {
  const id = nextId("puffy");
  const rand = mulberry32(seed);
  const hx = 22 + rand() * 8;
  const hy = 18 + rand() * 8;
  return (
    `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="65%">` +
    `<stop offset="0%" stop-color="#ffffff" stop-opacity="0.65"/>` +
    `<stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>` +
    `</radialGradient></defs>` +
    `<path d="${pathD}" fill="#000000" opacity="0.18" transform="translate(2.5 3.5)"/>` +
    `<path d="${pathD}" fill="${fill}" stroke="#101014" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="${pathD}" fill="url(#${id})"/>`
  );
}

/** Fill at reduced opacity + a small specular highlight — a translucent plastic/acrylic charm. */
export function plasticFinish(pathD: string, fill: string, seed: number): string {
  const rand = mulberry32(seed);
  const hx = 20 + rand() * 10;
  const hy = 16 + rand() * 8;
  return (
    `<path d="${pathD}" fill="${fill}" fill-opacity="0.62" stroke="#101014" stroke-width="1.8" stroke-linejoin="round" stroke-opacity="0.7"/>` +
    `<ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="6" ry="3" fill="#ffffff" opacity="0.7"/>`
  );
}

/** Wobbly die-cut outline + a couple of restrained hairline texture strokes + a light drop-shadow. Kept subtle. */
export function paperCutoutFinish(pathD: string, fill: string, seed: number): string {
  const id = nextId("cutoutShadow");
  const rand = mulberry32(seed);
  let hairlines = "";
  for (let i = 0; i < 2; i++) {
    const x1 = 14 + rand() * 30;
    const y1 = 14 + rand() * 30;
    const len = 6 + rand() * 6;
    const angle = rand() * Math.PI;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    hairlines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#101014" stroke-width="0.7" opacity="0.15" stroke-linecap="round"/>`;
  }
  return (
    `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feDropShadow dx="1.2" dy="1.8" stdDeviation="1" flood-opacity="0.28"/>` +
    `</filter></defs>` +
    `<path d="${pathD}" fill="${fill}" stroke="#101014" stroke-width="2.2" stroke-linejoin="round" filter="url(#${id})"/>${hairlines}`
  );
}

/** Many tiny irregular sparkle shapes clipped inside the sticker's own outline — a scattered, uneven glitter fill, not one flat glitter gradient. */
export function glitterFill(pathD: string, seed: number, colorA: string, colorB: string): string {
  const clipId = nextId("glitterClip");
  const rand = mulberry32(seed);
  let sparkles = "";
  for (let i = 0; i < 26; i++) {
    const x = rand() * 64;
    const y = rand() * 64;
    const r = 0.8 + rand() * 2;
    const fill = rand() > 0.5 ? colorA : rand() > 0.5 ? colorB : "#ffffff";
    sparkles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" opacity="${(0.5 + rand() * 0.5).toFixed(2)}"/>`;
  }
  return (
    `<defs><clipPath id="${clipId}"><path d="${pathD}"/></clipPath></defs>` +
    `<path d="${pathD}" fill="${colorA}" stroke="#101014" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<g clip-path="url(#${clipId})">${sparkles}</g>`
  );
}

/** Matte fill + a dashed stitch-line tracing the same outline — a woven ribbon/fabric patch, no gloss. */
export function fabricFinish(pathD: string, fill: string, seed: number): string {
  const id = nextId("fabricShadow");
  const rand = mulberry32(seed);
  const dash = (1.6 + rand() * 1.2).toFixed(1);
  return (
    `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feDropShadow dx="1" dy="1.6" stdDeviation="0.8" flood-opacity="0.2"/>` +
    `</filter></defs>` +
    `<path d="${pathD}" fill="${fill}" stroke="#101014" stroke-width="2" stroke-linejoin="round" filter="url(#${id})"/>` +
    `<path d="${pathD}" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="${dash} ${dash}" opacity="0.45"/>`
  );
}

/** Paper-cutout-style shadow + a sparse halftone dot grid instead of hairline grain — glossy print-stock feel. */
export function magazineFinish(pathD: string, fill: string, seed: number): string {
  const clipId = nextId("magazineClip");
  const shadowId = nextId("magazineShadow");
  const rand = mulberry32(seed);
  let dots = "";
  for (let i = 0; i < 24; i++) {
    const x = rand() * 64;
    const y = rand() * 64;
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" fill="#101014" opacity="0.12"/>`;
  }
  return (
    `<defs><clipPath id="${clipId}"><path d="${pathD}"/></clipPath>` +
    `<filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feDropShadow dx="1.4" dy="2" stdDeviation="1" flood-opacity="0.3"/>` +
    `</filter></defs>` +
    `<path d="${pathD}" fill="${fill}" stroke="#101014" stroke-width="2.2" stroke-linejoin="round" filter="url(#${shadowId})"/>` +
    `<g clip-path="url(#${clipId})">${dots}</g>`
  );
}

/**
 * A loose cluster of 3-7 small irregular faceted gems, imperfect spacing,
 * each with its own tiny highlight — "someone glued rhinestones onto a
 * scrapbook page," not one flat diamond icon. The flagship "crystal" ask.
 */
export function rhinestoneClusterSvg(seed: number, colorA: string, colorB: string, count = 5): string {
  const rand = mulberry32(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const cx = 10 + rand() * 44;
    const cy = 10 + rand() * 44;
    const r = 5 + rand() * 6;
    const gemSeed = seed + i * 977;
    const d = gemPolygonPath(cx, cy, r, gemSeed);
    const fill = rand() > 0.32 ? colorA : colorB;
    out +=
      `<path d="${d}" fill="${fill}" fill-opacity="${(0.82 + rand() * 0.18).toFixed(2)}" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.6"/>` +
      `<ellipse cx="${(cx - r * 0.25).toFixed(1)}" cy="${(cy - r * 0.3).toFixed(1)}" rx="${(r * 0.22).toFixed(1)}" ry="${(r * 0.12).toFixed(1)}" fill="#ffffff" opacity="0.75"/>`;
  }
  return out;
}
