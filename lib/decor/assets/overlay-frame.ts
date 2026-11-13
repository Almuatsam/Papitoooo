/**
 * Loader for a theme's overlay frames (`strip.overlayFrame`, e.g. Graduation):
 * one ready-made PNG per layout, drawn over the photos. Images are cached by
 * URL as promises, so a frame is fetched and decoded once and a render that
 * starts while it is still loading waits for the same load instead of
 * drawing without its frame. A failed load is evicted so the next render
 * retries rather than caching the failure.
 */

import { loadHtmlImage } from "@/lib/decor/load-image";
import type { ThemeDef } from "@/lib/themes/types";
import type { LayoutId } from "@/types";

const cache = new Map<string, Promise<HTMLImageElement>>();

export function overlayFrameUrl(overlay: NonNullable<ThemeDef["strip"]["overlayFrame"]>, layoutId: LayoutId): string {
  return `${overlay.dir}/${layoutId}.png`;
}

export function loadOverlayFrame(url: string): Promise<HTMLImageElement> {
  let pending = cache.get(url);
  if (!pending) {
    pending = loadHtmlImage(url);
    cache.set(url, pending);
    pending.catch(() => cache.delete(url));
  }
  return pending;
}

/** Warms the cache for a theme + layout so the first strip render finds its frame already decoded. Never throws. */
export function preloadOverlayFrame(strip: ThemeDef["strip"], layoutId: LayoutId): void {
  if (!strip.overlayFrame) return;
  loadOverlayFrame(overlayFrameUrl(strip.overlayFrame, layoutId)).catch(() => {
    // The render itself reports a failed load; a warm-up failing is not worth a second message.
  });
}
