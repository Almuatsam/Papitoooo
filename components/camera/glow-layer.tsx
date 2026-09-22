import type { GlowEffect } from "@/lib/filters";

interface GlowLayerProps {
  /** The same image the glow is layered on top of — a blurred, brightened copy of it. */
  src: string;
  glow: GlowEffect | undefined;
}

/**
 * Approximates a filter's bloom (see `GlowEffect`) over a static preview
 * image using real CSS, not canvas: a second copy of the same photo, blurred
 * and brightened, screen-blended on top. This mirrors the blur → brighten →
 * `globalCompositeOperation = "screen"` steps `prepFrame` bakes into the
 * exported strip (lib/strip-renderer.ts) — CSS `filter: blur()` on a DOM
 * element works fine on iOS Safari; it's only `CanvasRenderingContext2D.filter`
 * that Safari silently ignores, which is why the canvas path has its own
 * pixel-level fallback instead of relying on this component for export.
 */
export function GlowLayer({ src, glow }: GlowLayerProps) {
  if (!glow) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative duplicate of an already-loaded data URL, not a real <img>
    <img
      aria-hidden
      src={src}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      style={{
        filter: `blur(${glow.blurPx}px) brightness(${glow.brightness})`,
        mixBlendMode: "screen",
        opacity: glow.opacity,
      }}
    />
  );
}
