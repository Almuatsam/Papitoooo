/**
 * Reads a *live* CSS custom property from the DOM at render time — used for
 * font-family stacks (`--font-orbitron` etc, set by next/font) so the strip
 * renderer's baked captions always use exactly what's loaded, without
 * duplicating font names in JS.
 *
 * Strip *colours* are no longer read this way: each theme keeps its own
 * fixed palette in lib/themes.ts (the app shell has one unified look now,
 * so there's nothing theme-reactive left in the DOM's CSS variables).
 */
export function readCssVar(name: string, root: HTMLElement = document.documentElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}
