import { Music2, PawPrint, Plane, Receipt as ReceiptIcon, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { StripThemeId } from "@/types";

/** One icon per strip theme — used by the compact header ThemeSwitcher (the customizer's own theme picker uses full visual previews instead, see components/result/theme-browser.tsx). */
export const THEME_ICONS: Record<StripThemeId, LucideIcon> = {
  "streaming-card": Music2,
  "boarding-pass": Plane,
  receipt: ReceiptIcon,
  "leopard-scrapbook": Sparkles,
  "zebra-stripes": PawPrint,
  "glitter-star": Star,
};
