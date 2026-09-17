/**
 * Turns a theme's curated `piecePool` into the actual set of pieces drawn
 * on a given strip render: a seeded shuffle picks *which* candidates show
 * up, then each selected piece gets a small seeded nudge to its angle,
 * scale, and position so two sessions that happen to pick the same pool
 * entry still don't render identically.
 *
 * Both steps are pure functions of (pool, seed) — never `Math.random()` —
 * so a given session's seed (`SessionSettings.decorSeed`, threaded in via
 * `RenderStripInput`) always reproduces the same composition. That's what
 * keeps the live preview and the downloaded PNG pixel-identical even though
 * the composition itself is now randomized per capture session rather than
 * fixed per theme.
 */

import { mulberry32 } from "@/lib/decor/seed";
import type { StripPiecePlacement } from "@/lib/themes";

/**
 * Seeded Fisher-Yates + take-first-N over the *optional* pieces, with every
 * `required` piece always included on top. `countRange` is interpreted as
 * the total piece count (required + optional), clamped so it never drops
 * below the required count — a theme's signature elements (barcode,
 * receipt header, stamps, ...) always render even if the seed would
 * otherwise pick a low count.
 */
export function selectDecorPieces(
  pool: StripPiecePlacement[],
  countRange: [number, number],
  seed: number,
): StripPiecePlacement[] {
  const required = pool.filter((p) => p.required);
  const optional = pool.filter((p) => !p.required);

  const rand = mulberry32(seed);
  const [min, max] = countRange;
  const total = Math.max(required.length, min + Math.floor(rand() * (max - min + 1)));
  const optionalCount = Math.min(optional.length, Math.max(0, total - required.length));

  const shuffled = [...optional];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return [...required, ...shuffled.slice(0, optionalCount)];
}

/** Small seeded nudge to a selected piece's angle/scale/offset — same pool entry, never quite the same instance. */
export function jitterPiece(piece: StripPiecePlacement, seed: number): StripPiecePlacement {
  const rand = mulberry32(seed);
  const angleJitter = (rand() * 2 - 1) * 6;
  const scaleJitter = 0.9 + rand() * 0.22;
  const offsetJitterX = (rand() * 2 - 1) * 16;
  const offsetJitterY = (rand() * 2 - 1) * 16;
  return {
    ...piece,
    angle: piece.angle + angleJitter,
    scale: (piece.scale ?? 1) * scaleJitter,
    offset: {
      x: (piece.offset?.x ?? 0) + offsetJitterX,
      y: (piece.offset?.y ?? 0) + offsetJitterY,
    },
  };
}
