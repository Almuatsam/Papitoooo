import type { StripThemeId } from "@/types";
import type { ThemeDef } from "@/lib/themes/types";
import { streamingCard } from "@/lib/themes/streaming-card";
import { arcadeCorkboard } from "@/lib/themes/arcade-corkboard";
import { boardingPass } from "@/lib/themes/boarding-pass";
import { receipt } from "@/lib/themes/receipt";
import { parAvion } from "@/lib/themes/par-avion";
import { leopardScrapbook } from "@/lib/themes/leopard-scrapbook";

export type {
  CaptionTreatment,
  MaterialId,
  PieceAnchor,
  PieceColorSlot,
  PieceEdge,
  StripBackground,
  StripPieceKind,
  StripPiecePlacement,
  ThemeColors,
  ThemeDef,
} from "@/lib/themes/types";

export const THEMES: ThemeDef[] = [
  streamingCard,
  arcadeCorkboard,
  boardingPass,
  receipt,
  parAvion,
  leopardScrapbook,
];

const THEME_MAP: Record<StripThemeId, ThemeDef> = THEMES.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<StripThemeId, ThemeDef>,
);

export function getTheme(id: StripThemeId): ThemeDef {
  return THEME_MAP[id] ?? THEMES[0];
}

/** Swatches offered in the customizer. `""` means "use the theme default". */
export const BORDER_SWATCHES = ["", "#101014", "#ffffff", "#c8102e", "#c9a227", "#0a1f44", "#00e5ff"];
export const BG_SWATCHES = ["", "#ffffff", "#f7f4ec", "#101014", "#fdf6e8", "#f5efe0", "#12163a"];
/** Swatches for a theme's `strip.headerBand` colour (Boarding Pass). `""` = theme default (blue). */
export const ACCENT_SWATCHES = ["", "#0a1f44", "#c8102e", "#0f6e3e", "#c9a227", "#5b2a86", "#101014"];
