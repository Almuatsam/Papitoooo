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
 * layer, each blurred and brightened, screen-blended on top. This mirrors
 * the blur → brighten → `globalCompositeOperation = "screen"` steps
 * `prepFrame` bakes into the exported strip (lib/strip-renderer.ts) —
 * CSS `filter: blur()` on a DOM element works fine on iOS Safari; it's only
 * `CanvasRenderingContext2D.filter` that Safari silently ignores, which is
 * why the canvas path has its own pixel-level fallback instead of relying on
 * this component for export.
 *
 * `strip-renderer.ts`'s `makeGlowLayer` blurs a downscaled copy of the photo
 * and draws it back up, so a layer's *effective* blur radius on the full
 * photo works out to `blurFrac * <photo's rendered width>` regardless of its
 * `downscale` (the downscale factor cancels out algebraically). CSS
 * `blur()` has no notion of the photo's actual on-screen pixel width, so
 * this approximates that same effective radius against the photo's known
 * native width (`PHOTO_WIDTH`) — close enough for a live preview; the
 * canvas export is the pixel-accurate, resolution-relative version.
 */
export function GlowLayer({ src, glow }: GlowLayerProps) {
  if (!glow) return null;

  return (
    <>
      {glow.layers.map((layer, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- decorative duplicate of an already-loaded data URL, not a real <img>
        <img
          key={i}
          aria-hidden
          src={src}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{
            filter: `blur(${layer.blurFrac * PHOTO_WIDTH}px) brightness(${layer.brightness})`,
            mixBlendMode: "screen",
            opacity: layer.opacity,
          }}
        />
      ))}
    </>
  );
}
