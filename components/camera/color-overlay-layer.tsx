import type { ColorOverlay } from "@/lib/filters";

interface ColorOverlayLayerProps {
  overlay: ColorOverlay | undefined;
}

/** Renders a filter's translucent color wash on top of whatever sits behind it (video preview or a captured frame). */
export function ColorOverlayLayer({ overlay }: ColorOverlayLayerProps) {
  if (!overlay) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: overlay.color,
        opacity: overlay.opacity,
        // CSS `mix-blend-mode` mirrors the canvas export's `globalCompositeOperation`
        // (see prepFrame in lib/strip-renderer.ts) — "multiply"/"soft-light" grade the
        // tone instead of flattening the preview under a flat color.
        mixBlendMode: overlay.blend && overlay.blend !== "source-over" ? overlay.blend : undefined,
      }}
    />
  );
}
