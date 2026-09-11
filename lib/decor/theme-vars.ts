/**
 * Reads the *live* theme CSS custom properties (colours + font stacks) from
 * the DOM at render time, instead of duplicating them in JS. This is the
 * single source of truth: `app/globals.css` defines every theme's palette
 * and fonts once, both the on-screen chrome and the baked strip export read
 * the same values, so they can never drift out of sync.
 */

export interface ThemeColors {
  paper: string;
  panel: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
}

function readVarRgb(name: string, root: HTMLElement, fallback: string): string {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  return raw ? `rgb(${raw})` : fallback;
}

export function readThemeColors(root: HTMLElement = document.documentElement): ThemeColors {
  return {
    paper: readVarRgb("--paper", root, "#ffffff"),
    panel: readVarRgb("--panel", root, "#ffffff"),
    ink: readVarRgb("--ink", root, "#101014"),
    muted: readVarRgb("--muted", root, "#6e6e76"),
    accent: readVarRgb("--accent", root, "#e2231a"),
    accent2: readVarRgb("--accent2", root, "#101014"),
    line: readVarRgb("--line", root, "#101014"),
  };
}

/** Raw (non-colour) custom property value, e.g. a font-family stack. */
export function readCssVar(name: string, root: HTMLElement = document.documentElement): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}
