import { Gamepad2, Mail, Music2, Plane, Receipt as ReceiptIcon, Sparkles, type LucideIcon } from "lucide-react";
import type { StripThemeId } from "@/types";

/** One icon per strip theme — used by the compact header ThemeSwitcher (the customizer's own theme picker uses full visual previews instead, see components/result/theme-browser.tsx). */
export const THEME_ICONS: Record<StripThemeId, LucideIcon> = {
  "streaming-card": Music2,
  "arcade-corkboard": Gamepad2,
  "boarding-pass": Plane,
  receipt: ReceiptIcon,
  "par-avion": Mail,
  "leopard-scrapbook": Sparkles,
};
