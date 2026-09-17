import { Flag, Gamepad2, Mail, Music2, PenLine, Plane, Receipt as ReceiptIcon, type LucideIcon } from "lucide-react";
import type { StripThemeId } from "@/types";

/** One icon per strip theme — used by the compact header ThemeSwitcher (the customizer's own theme picker uses full visual previews instead, see components/result/theme-browser.tsx). */
export const THEME_ICONS: Record<StripThemeId, LucideIcon> = {
  "festival-poster": Flag,
  "streaming-card": Music2,
  "arcade-corkboard": Gamepad2,
  "doodle-diary": PenLine,
  "boarding-pass": Plane,
  receipt: ReceiptIcon,
  "par-avion": Mail,
};
