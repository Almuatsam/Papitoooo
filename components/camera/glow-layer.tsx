import type { GlowEffect } from "@/lib/filters";
import { PHOTO_WIDTH } from "@/lib/constants";

interface GlowLayerProps {
  /** The same image the glow is layered on top of — a blurred, brightened copy of it. */
  src: string;
  glow: GlowEffect | undefined;
}

/**
 * Approximates a filter's bloom (see `GlowEffect`) over a static preview
 * image using real CSS, not canvas: one stacked `<img>` duplicate per glow
 * layer, each pushed through a threshold-ish contrast boost, blurred, and
 * brightened, screen-blended on top. This mirrors the extract-highlights →
 * blur → brighten → `globalCompositeOperation = "screen"` steps
 * `makeGlowLayer` bakes into the exported strip (lib/strip-renderer.ts) —
 * CSS `filter: blur()` on a DOM element works fine on iOS Safari; it's only
 * `CanvasRenderingContext2D.filter` that Safari silently ignores, which is
 * why the canvas path has its own pixel-level fallback instead of relying on
 * this component for export.
 *
 * CSS has no per-pixel `extractTintedHighlights` equivalent, so `threshold`
 * is approximated with a large `contrast()` boost instead: contrast is
 * centered on mid-gray, so cranking it up crushes anything already darker
 * than mid-gray toward black and blows anything lighter toward white — a
 * blunter, DOM-only stand-in for "only bright pixels survive" that's close
 * enough for this fleeting review-frame flash. `tint` (an RGB triple, only
 * meaningful per-pixel on canvas) has no CSS equivalent here and is skipped;
 * this preview is an approximation, not the pixel-accurate version — that's
 * the canvas export (also what the Result screen's own strip preview
 * renders through, so *that* preview is fully accurate, tint included).
 *
 * `strip-renderer.ts`'s `makeGlowLayer` blurs a downscaled copy of the photo
 * and draws it back up, so a layer's *effective* blur radius on the full
 * photo works out to `blurFrac * <photo's rendered width>` regardless of its
 * `downscale` (the downscale factor cancels out algebraically). CSS
 * `blur()` has no notion of the photo's actual on-screen pixel width, so
 * this approximates that same effective radius against the photo's known
 * native width (`PHOTO_WIDTH`).
 */
export function GlowLayer({ src, glow }: GlowLayerProps) {
  if (!glow) return null;

  return (
    <>
      {glow.layers.map((layer, i) => {
        // threshold 0.4 -> ~2.5x contrast, threshold 0.7 -> ~5x: higher
        // threshold means a tighter/brighter pass, so it gets a harder crush.
        const contrast = 1 / Math.max(0.1, 1 - layer.threshold);
        return (
          // eslint-disable-next-line @next/next/no-img-element -- decorative duplicate of an already-loaded data URL, not a real <img>
          <img
            key={i}
            aria-hidden
            src={src}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              filter: `contrast(${contrast}) blur(${layer.blurFrac * PHOTO_WIDTH}px) brightness(${layer.brightness})`,
              mixBlendMode: "screen",
              opacity: layer.opacity,
            }}
          />
        );
      })}
    </>
  );
}
