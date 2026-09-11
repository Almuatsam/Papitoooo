/**
 * Curated Y2K sticker collections. Each sticker is a small, self-contained
 * SVG string (portable — works as `<img src="data:image/svg+xml,...">` in
 * the tray, and rasterises the same way when baked into the strip export).
 * Curated, not exhaustive: ~6 stickers per collection, built from a small
 * set of parameterised generators so the set stays consistent and easy to
 * extend rather than 80 one-off hand-drawn files.
 */

export type StickerCollectionId =
  | "y2k"
  | "cute"
  | "glitter"
  | "retro"
  | "camera"
  | "food"
  | "flowers"
  | "stars"
  | "hearts"
  | "animals"
  | "music"
  | "internet"
  | "doodles";

export interface StickerDef {
  id: string;
  collection: StickerCollectionId;
  label: string;
  svg: string;
}

export const STICKER_COLLECTIONS: { id: StickerCollectionId; label: string }[] = [
  { id: "y2k", label: "Y2K" },
  { id: "cute", label: "Cute" },
  { id: "glitter", label: "Glitter" },
  { id: "retro", label: "Retro" },
  { id: "camera", label: "Digital Cam" },
  { id: "food", label: "Food" },
  { id: "flowers", label: "Flowers" },
  { id: "stars", label: "Stars" },
  { id: "hearts", label: "Hearts" },
  { id: "animals", label: "Animals" },
  { id: "music", label: "Music" },
  { id: "internet", label: "Internet" },
  { id: "doodles", label: "Doodles" },
];

function wrap(inner: string, vb = "0 0 64 64"): string {
  // Explicit width/height (not just viewBox) so the browser has an
  // unambiguous intrinsic size the moment the image decodes — some engines
  // fall back to a 300x150 default for viewBox-only SVGs used as <img> src,
  // which throws off Fabric's placement/caching of the sticker.
  const [, , w, h] = vb.split(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${inner}</svg>`;
}

function outlined(shape: string, extraAttrs = ""): string {
  return `<g stroke="#101014" stroke-width="2.5" stroke-linejoin="round" ${extraAttrs}>${shape}</g>`;
}

function heartPath(cx: number, cy: number, s: number): string {
  return `M${cx} ${cy + s * 0.34} C${cx - s} ${cy - s * 0.5} ${cx - s * 0.4} ${cy - s * 1.15} ${cx} ${cy - s * 0.42} C${cx + s * 0.4} ${cy - s * 1.15} ${cx + s} ${cy - s * 0.5} ${cx} ${cy + s * 0.34} Z`;
}

function starPath(cx: number, cy: number, rOuter: number, rInner: number, points = 5): string {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${d}Z`;
}

function badge(fill: string, emoji: string, ring = "#101014"): string {
  return wrap(
    `<circle cx="32" cy="32" r="28" fill="${fill}" stroke="${ring}" stroke-width="3"/>` +
      `<text x="32" y="43" font-size="30" text-anchor="middle" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${emoji}</text>`,
  );
}

function heartSticker(id: string, label: string, fill: string): StickerDef {
  return {
    id,
    collection: "hearts",
    label,
    svg: wrap(outlined(`<path d="${heartPath(32, 34, 22)}" fill="${fill}"/>`)),
  };
}

function starSticker(id: string, label: string, fill: string, points = 5): StickerDef {
  return {
    id,
    collection: "stars",
    label,
    svg: wrap(outlined(`<path d="${starPath(32, 32, 26, 11, points)}" fill="${fill}"/>`)),
  };
}

let uid = 0;
function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}-${uid}`;
}

const PINK = "#ff2f92";
const RED = "#e2231a";
const YELLOW = "#ffd400";
const BLUE = "#6ec3ff";
const BABY_BLUE = "#a8d8ff";
const ORANGE = "#ff6a13";
const SILVER = "#c8ccd0";
const CREAM = "#fbf3e3";
const GOLD = "#d8a93a";

export const STICKERS: StickerDef[] = [
  // ---- Hearts -----------------------------------------------------------
  heartSticker(nextId("heart"), "Pink heart", PINK),
  heartSticker(nextId("heart"), "Red heart", RED),
  heartSticker(nextId("heart"), "Blue heart", BLUE),
  heartSticker(nextId("heart"), "Yellow heart", YELLOW),
  {
    id: nextId("heart"),
    collection: "hearts",
    label: "Double heart",
    svg: wrap(
      outlined(`<path d="${heartPath(24, 30, 15)}" fill="${PINK}" opacity="0.9"/>`) +
        outlined(`<path d="${heartPath(38, 38, 15)}" fill="${YELLOW}" opacity="0.9"/>`),
    ),
  },
  {
    id: nextId("heart"),
    collection: "hearts",
    label: "Heart & arrow",
    svg: wrap(
      outlined(`<path d="${heartPath(32, 34, 20)}" fill="${RED}"/>`) +
        `<line x1="6" y1="52" x2="54" y2="12" stroke="#101014" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M48 10 L56 10 L56 18" fill="none" stroke="#101014" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },

  // ---- Stars --------------------------------------------------------------
  starSticker(nextId("star"), "Pink star", PINK),
  starSticker(nextId("star"), "Yellow star", YELLOW),
  starSticker(nextId("star"), "Blue star", BLUE),
  starSticker(nextId("star"), "4-point star", RED, 4),
  {
    id: nextId("star"),
    collection: "stars",
    label: "Shooting star",
    svg: wrap(
      outlined(`<path d="${starPath(40, 22, 14, 6)}" fill="${YELLOW}"/>`) +
        `<path d="M28 32 L4 56" stroke="#101014" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M28 32 L4 56" stroke="${YELLOW}" stroke-width="1.4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: nextId("star"),
    collection: "stars",
    label: "Star cluster",
    svg: wrap(
      outlined(`<path d="${starPath(22, 26, 12, 5)}" fill="${PINK}"/>`) +
        outlined(`<path d="${starPath(42, 20, 8, 3.4)}" fill="${YELLOW}"/>`) +
        outlined(`<path d="${starPath(38, 42, 10, 4.2)}" fill="${BLUE}"/>`),
    ),
  },

  // ---- Glitter / sparkle --------------------------------------------------
  ...[PINK, GOLD, BLUE].map((fill, i) => ({
    id: nextId("glitter"),
    collection: "glitter" as const,
    label: "Sparkle",
    svg: wrap(
      outlined(
        `<path d="M32 6c1.6 10 6.4 15.6 18 18-11.6 2.4-16.4 8-18 18-1.6-10-6.4-15.6-18-18 11.6-2.4 16.4-8 18-18z" fill="${fill}"/>` +
          `<circle cx="52" cy="14" r="3.2" fill="${i === 0 ? YELLOW : fill}"/>` +
          `<circle cx="12" cy="50" r="2.2" fill="${i === 1 ? RED : fill}"/>`,
      ),
    ),
  })),
  {
    id: nextId("glitter"),
    collection: "glitter",
    label: "Diamond",
    svg: wrap(
      outlined(`<path d="M16 26 L32 8 L48 26 L32 58 Z" fill="${BABY_BLUE}"/>` + `<path d="M16 26 L48 26 L32 58 Z" fill="${BLUE}" opacity="0.6"/>`),
    ),
  },
  {
    id: nextId("glitter"),
    collection: "glitter",
    label: "Twinkle trio",
    svg: wrap(
      `<g fill="${GOLD}">` +
        `<path d="M14 12c.8 4.6 3 6.8 7.6 7.6-4.6.8-6.8 3-7.6 7.6-.8-4.6-3-6.8-7.6-7.6 4.6-.8 6.8-3 7.6-7.6z"/>` +
        `<path d="M46 30c1 5.4 3.6 8 9 9-5.4 1-8 3.6-9 9-1-5.4-3.6-8-9-9 5.4-1 8-3.6 9-9z"/>` +
        `<path d="M22 42c.6 3.4 2.2 5 5.6 5.6-3.4.6-5 2.2-5.6 5.6-.6-3.4-2.2-5-5.6-5.6 3.4-.6 5-2.2 5.6-5.6z"/>` +
        `</g>`,
    ),
  },

  // ---- Y2K -----------------------------------------------------------------
  {
    id: nextId("y2k"),
    collection: "y2k",
    label: "CD disc",
    svg: wrap(
      outlined(
        `<circle cx="32" cy="32" r="26" fill="${SILVER}"/>` +
          `<circle cx="32" cy="32" r="8" fill="#ffffff"/>` +
          `<circle cx="32" cy="32" r="3" fill="#101014"/>`,
      ) + `<path d="M14 16 A26 26 0 0 1 50 16" stroke="${PINK}" stroke-width="4" fill="none" opacity="0.8"/>`,
    ),
  },
  {
    id: nextId("y2k"),
    collection: "y2k",
    label: "Flame",
    svg: wrap(
      outlined(
        `<path d="M32 6c8 10-6 14-2 24 2-4 6-4 6 0 0 8-8 14-16 14-9 0-16-7-16-15 0-11 9-15 9-24 4 4 4 9 2 13 4-4 12-6 17-12z" fill="${ORANGE}"/>`,
      ),
    ),
  },
  {
    id: nextId("y2k"),
    collection: "y2k",
    label: "Chrome orb",
    svg: wrap(
      `<circle cx="32" cy="32" r="26" fill="${SILVER}" stroke="#101014" stroke-width="2.5"/>` +
        `<ellipse cx="24" cy="20" rx="10" ry="5" fill="#ffffff" opacity="0.8"/>`,
    ),
  },
  {
    id: nextId("y2k"),
    collection: "y2k",
    label: "Butterfly",
    svg: wrap(
      outlined(
        `<path d="M32 32c-2-10-14-18-20-12-5 5 1 16 20 16z" fill="${PINK}"/>` +
          `<path d="M32 32c2-10 14-18 20-12 5 5-1 16-20 16z" fill="${BLUE}"/>` +
          `<path d="M32 32c-1 8-10 14-15 10-4-3 0-12 15-12z" fill="${PINK}" opacity="0.85"/>` +
          `<path d="M32 32c1 8 10 14 15 10 4-3 0-12-15-12z" fill="${BLUE}" opacity="0.85"/>` +
          `<line x1="32" y1="20" x2="32" y2="46" stroke="#101014" stroke-width="2.5"/>`,
      ),
    ),
  },
  {
    id: nextId("y2k"),
    collection: "y2k",
    label: "Lightning",
    svg: wrap(outlined(`<path d="M36 4 12 36h14l-4 24 26-34H34z" fill="${YELLOW}"/>`)),
  },
  {
    id: nextId("y2k"),
    collection: "y2k",
    label: "Starburst tag",
    svg: wrap(outlined(`<path d="${starPath(32, 32, 28, 20, 10)}" fill="${RED}"/>`) + `<text x="32" y="38" font-size="13" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700">Y2K</text>`),
  },

  // ---- Cute -----------------------------------------------------------------
  {
    id: nextId("cute"),
    collection: "cute",
    label: "Bow",
    svg: wrap(
      outlined(
        `<path d="M30 32c-6-9-16-14-22-11-5 3-4 11 2 16 5 4 14 4 20-5z" fill="${PINK}"/>` +
          `<path d="M34 32c6-9 16-14 22-11 5 3 4 11-2 16-5 4-14 4-20-5z" fill="${PINK}"/>` +
          `<circle cx="32" cy="32" r="5.5" fill="${RED}"/>`,
      ),
    ),
  },
  {
    id: nextId("cute"),
    collection: "cute",
    label: "Blush face",
    svg: wrap(
      outlined(`<circle cx="32" cy="32" r="26" fill="${CREAM}"/>`) +
        `<circle cx="23" cy="30" r="2.6" fill="#101014"/><circle cx="41" cy="30" r="2.6" fill="#101014"/>` +
        `<circle cx="18" cy="38" r="4.5" fill="${PINK}" opacity="0.6"/><circle cx="46" cy="38" r="4.5" fill="${PINK}" opacity="0.6"/>` +
        `<path d="M24 40c3 4 13 4 16 0" fill="none" stroke="#101014" stroke-width="2.4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: nextId("cute"),
    collection: "cute",
    label: "Star-eyes",
    svg: wrap(
      outlined(`<circle cx="32" cy="32" r="26" fill="${YELLOW}"/>`) +
        `<path d="${starPath(23, 29, 5, 2)}" fill="#101014"/>` +
        `<path d="${starPath(41, 29, 5, 2)}" fill="#101014"/>` +
        `<path d="M22 40c4 5 16 5 20 0" fill="none" stroke="#101014" stroke-width="2.4" stroke-linecap="round"/>`,
    ),
  },
  { id: nextId("cute"), collection: "cute", label: "Pink ribbon", svg: badge(PINK, "🎀") },
  {
    id: nextId("cute"),
    collection: "cute",
    label: "Kawaii heart",
    svg: wrap(
      outlined(`<path d="${heartPath(32, 34, 22)}" fill="${PINK}"/>`) +
        `<circle cx="25" cy="30" r="1.8" fill="#101014"/><circle cx="35" cy="30" r="1.8" fill="#101014"/>` +
        `<path d="M27 35c2 2 6 2 8 0" fill="none" stroke="#101014" stroke-width="1.8" stroke-linecap="round"/>`,
    ),
  },
  { id: nextId("cute"), collection: "cute", label: "Cute cloud", svg: badge(BABY_BLUE, "☁️") },

  // ---- Retro ------------------------------------------------------------
  {
    id: nextId("retro"),
    collection: "retro",
    label: "Floppy disk",
    svg: wrap(
      outlined(
        `<rect x="10" y="8" width="44" height="48" rx="3" fill="${SILVER}"/>` +
          `<rect x="18" y="8" width="22" height="16" fill="#101014"/>` +
          `<rect x="16" y="34" width="32" height="18" fill="#ffffff"/>`,
      ),
    ),
  },
  {
    id: nextId("retro"),
    collection: "retro",
    label: "Cassette",
    svg: wrap(
      outlined(
        `<rect x="6" y="14" width="52" height="36" rx="4" fill="${CREAM}"/>` +
          `<circle cx="22" cy="32" r="8" fill="#ffffff"/><circle cx="42" cy="32" r="8" fill="#ffffff"/>` +
          `<circle cx="22" cy="32" r="3" fill="#101014"/><circle cx="42" cy="32" r="3" fill="#101014"/>`,
      ),
    ),
  },
  {
    id: nextId("retro"),
    collection: "retro",
    label: "CRT monitor",
    svg: wrap(
      outlined(
        `<rect x="8" y="8" width="48" height="36" rx="4" fill="${SILVER}"/>` +
          `<rect x="14" y="14" width="36" height="24" fill="#101014"/>` +
          `<rect x="22" y="46" width="20" height="8" fill="${SILVER}"/>`,
      ) + `<rect x="16" y="16" width="10" height="6" fill="${PINK}" opacity="0.8"/>`,
    ),
  },
  { id: nextId("retro"), collection: "retro", label: "Joystick", svg: badge(RED, "🕹️") },
  { id: nextId("retro"), collection: "retro", label: "Pager", svg: badge(SILVER, "📟") },
  {
    id: nextId("retro"),
    collection: "retro",
    label: "Dial-up",
    svg: wrap(
      outlined(`<circle cx="32" cy="32" r="26" fill="${YELLOW}"/>`) +
        `<text x="32" y="26" font-size="9" text-anchor="middle" font-family="monospace" fill="#101014">DIAL</text>` +
        `<text x="32" y="42" font-size="9" text-anchor="middle" font-family="monospace" fill="#101014">UP</text>`,
    ),
  },

  // ---- Digital camera ------------------------------------------------------
  {
    id: nextId("camera"),
    collection: "camera",
    label: "Flash burst",
    svg: wrap(outlined(`<path d="M32 4 10 34h14l-3 26 25-32H32z" fill="${YELLOW}"/>`)),
  },
  {
    id: nextId("camera"),
    collection: "camera",
    label: "Shutter ring",
    svg: wrap(
      outlined(`<circle cx="32" cy="32" r="24" fill="none" stroke-width="6"/>`) +
        `<circle cx="32" cy="32" r="10" fill="${RED}" stroke="#101014" stroke-width="2.5"/>`,
    ),
  },
  {
    id: nextId("camera"),
    collection: "camera",
    label: "Film frame",
    svg: wrap(
      outlined(`<rect x="8" y="16" width="48" height="32" rx="2" fill="#101014"/>`) +
        `<rect x="14" y="22" width="36" height="20" fill="${SILVER}"/>` +
        `<rect x="10" y="18" width="4" height="4" fill="${YELLOW}"/><rect x="50" y="18" width="4" height="4" fill="${YELLOW}"/>` +
        `<rect x="10" y="42" width="4" height="4" fill="${YELLOW}"/><rect x="50" y="42" width="4" height="4" fill="${YELLOW}"/>`,
    ),
  },
  {
    id: nextId("camera"),
    collection: "camera",
    label: "Battery",
    svg: wrap(
      outlined(
        `<rect x="12" y="20" width="36" height="24" rx="3" fill="${SILVER}"/>` +
          `<rect x="48" y="28" width="6" height="8" fill="#101014"/>` +
          `<rect x="17" y="25" width="8" height="14" fill="${PINK}"/>`,
      ),
    ),
  },
  {
    id: nextId("camera"),
    collection: "camera",
    label: "Crosshair",
    svg: wrap(
      outlined(`<circle cx="32" cy="32" r="18" fill="none" stroke-width="2.5"/>`) +
        `<line x1="32" y1="4" x2="32" y2="18" stroke="#101014" stroke-width="2.5"/>` +
        `<line x1="32" y1="46" x2="32" y2="60" stroke="#101014" stroke-width="2.5"/>` +
        `<line x1="4" y1="32" x2="18" y2="32" stroke="#101014" stroke-width="2.5"/>` +
        `<line x1="46" y1="32" x2="60" y2="32" stroke="#101014" stroke-width="2.5"/>` +
        `<circle cx="32" cy="32" r="4" fill="${RED}"/>`,
    ),
  },
  { id: nextId("camera"), collection: "camera", label: "Camera", svg: badge(SILVER, "📷") },

  // ---- Food -------------------------------------------------------------
  { id: nextId("food"), collection: "food", label: "Strawberry", svg: badge("#ffe1e8", "🍓") },
  { id: nextId("food"), collection: "food", label: "Donut", svg: badge("#ffd9ec", "🍩") },
  { id: nextId("food"), collection: "food", label: "Pizza", svg: badge(YELLOW, "🍕") },
  { id: nextId("food"), collection: "food", label: "Ice cream", svg: badge(BABY_BLUE, "🍦") },
  { id: nextId("food"), collection: "food", label: "Boba", svg: badge(CREAM, "🧋") },
  { id: nextId("food"), collection: "food", label: "Candy", svg: badge(PINK, "🍬") },

  // ---- Flowers ------------------------------------------------------------
  ...[PINK, YELLOW, BLUE, RED, CREAM, GOLD].map((fill) => ({
    id: nextId("flower"),
    collection: "flowers" as const,
    label: "Flower",
    svg: wrap(
      outlined(
        [0, 1, 2, 3, 4]
          .map((i) => {
            const a = (Math.PI * 2 * i) / 5;
            const cx = 32 + Math.cos(a) * 12;
            const cy = 32 + Math.sin(a) * 12;
            return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="11" ry="7" fill="${fill}" transform="rotate(${(a * 180) / Math.PI} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`;
          })
          .join(""),
      ) + `<circle cx="32" cy="32" r="7" fill="#101014" opacity="0.85"/>`,
    ),
  })),

  // ---- Animals ------------------------------------------------------------
  { id: nextId("animals"), collection: "animals", label: "Cat", svg: badge(CREAM, "🐱") },
  { id: nextId("animals"), collection: "animals", label: "Dog", svg: badge("#f4dcc4", "🐶") },
  { id: nextId("animals"), collection: "animals", label: "Bunny", svg: badge("#ffffff", "🐰") },
  { id: nextId("animals"), collection: "animals", label: "Panda", svg: badge(SILVER, "🐼") },
  { id: nextId("animals"), collection: "animals", label: "Butterfly", svg: badge(BABY_BLUE, "🦋") },
  { id: nextId("animals"), collection: "animals", label: "Chick", svg: badge(YELLOW, "🐣") },

  // ---- Music --------------------------------------------------------------
  { id: nextId("music"), collection: "music", label: "Notes", svg: badge(PINK, "🎵") },
  { id: nextId("music"), collection: "music", label: "Headphones", svg: badge("#101014", "🎧") },
  { id: nextId("music"), collection: "music", label: "Mic", svg: badge(SILVER, "🎤") },
  { id: nextId("music"), collection: "music", label: "Boombox", svg: badge(YELLOW, "📻") },
  { id: nextId("music"), collection: "music", label: "CD", svg: badge(BABY_BLUE, "💿") },
  { id: nextId("music"), collection: "music", label: "Guitar", svg: badge(ORANGE, "🎸") },

  // ---- Internet culture -----------------------------------------------------
  { id: nextId("internet"), collection: "internet", label: "Floppy save", svg: badge(BLUE, "💾") },
  { id: nextId("internet"), collection: "internet", label: "Keyboard", svg: badge(SILVER, "⌨️") },
  { id: nextId("internet"), collection: "internet", label: "Alien", svg: badge(BABY_BLUE, "👾") },
  { id: nextId("internet"), collection: "internet", label: "Chat", svg: badge(PINK, "💬") },
  { id: nextId("internet"), collection: "internet", label: "Fire", svg: badge(ORANGE, "🔥") },
  { id: nextId("internet"), collection: "internet", label: "100", svg: badge(RED, "💯") },

  // ---- Doodles ------------------------------------------------------------
  {
    id: nextId("doodles"),
    collection: "doodles",
    label: "Squiggle",
    svg: wrap(`<path d="M6 32c6-14 12 14 18 0s12 14 18 0 12 14 16 0" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round"/>`),
  },
  {
    id: nextId("doodles"),
    collection: "doodles",
    label: "Scribble circle",
    svg: wrap(`<path d="M32 10c14 0 22 8 20 16-2 9-14 12-8 20 4 5-2 10-10 8-10-2-22-8-22-20 0-14 10-24 20-24z" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round"/>`),
  },
  {
    id: nextId("doodles"),
    collection: "doodles",
    label: "Swirl",
    svg: wrap(`<path d="M10 38c0-14 11-26 24-24 10 2 18 10 16 20-2 8-9 14-17 11-5-2-8-8-5-13 2-3 6-3 8 0" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round"/>`),
  },
  {
    id: nextId("doodles"),
    collection: "doodles",
    label: "Zigzag",
    svg: wrap(`<path d="M6 46 18 20 30 46 42 20 54 46" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    id: nextId("doodles"),
    collection: "doodles",
    label: "Squiggle arrow",
    svg: wrap(
      `<path d="M6 20c14 0 8 20 24 20 10 0 10-10 18-10" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M40 24 48 30 40 36" fill="none" stroke="#101014" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: nextId("doodles"),
    collection: "doodles",
    label: "Cloud",
    svg: wrap(
      `<path d="M16 40a10 10 0 010-20 12 12 0 0123-3 9 9 0 016 17z" fill="${CREAM}" stroke="#101014" stroke-width="3" stroke-linejoin="round"/>`,
    ),
  },
];

export function stickersByCollection(id: StickerCollectionId): StickerDef[] {
  return STICKERS.filter((s) => s.collection === id);
}

/** SVG markup -> data URL, for <img> tags and Fabric image sources. */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
