import type { ThemeDef } from "@/lib/themes/types";
import type { LayoutId } from "@/types";

/**
 * The theme's strip settings with the overlay frame's per-layout spacing
 * applied (`strip.overlayFrame.perLayout[layoutId]`). Returns the same object
 * when there is nothing to override, so every theme without per-layout frames
 * is untouched.
 */
export function stripForLayout(strip: ThemeDef["strip"], layoutId: LayoutId): ThemeDef["strip"] {
  const override = strip.overlayFrame?.perLayout?.[layoutId];
  return override ? { ...strip, ...override } : strip;
}

/** `theme` with {@link stripForLayout} applied to its strip. */
export function themeForLayout(theme: ThemeDef, layoutId: LayoutId): ThemeDef {
  const strip = stripForLayout(theme.strip, layoutId);
  return strip === theme.strip ? theme : { ...theme, strip };
}
