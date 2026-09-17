"use client";

import { Sparkles } from "lucide-react";
import type { CSSProperties } from "react";

interface Twinkle {
  top: string;
  /** Logical inline-start position (mirrors correctly in Arabic/RTL) — never `left`. */
  start: string;
  size: number;
  delay: number;
}

// A handful of genuine twinkle points on top of the grain texture below —
// pure noise has no motion, and "glitter" needs a couple of moving points
// of light to actually read as sparkle rather than static grain.
const TWINKLES: Twinkle[] = [
  { top: "10%", start: "12%", size: 12, delay: 0 },
  { top: "16%", start: "80%", size: 9, delay: 0.7 },
  { top: "60%", start: "90%", size: 11, delay: 0.3 },
  { top: "84%", start: "18%", size: 8, delay: 1.3 },
];

/**
 * A grainy metallic-glitter texture (SVG `feTurbulence` fractal noise,
 * magenta-tinted) plus a few twinkling points of light — a more concrete
 * stand-in for "glitter" than a repeated vector icon, while staying
 * code-only/procedural (this app has no raster asset pipeline; `public/`
 * is deliberately empty).
 */
export function GlitterOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.14] mix-blend-screen">
        <filter id="boothGlitterNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 0.18
                    0 0 0 0 0.77
                    0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#boothGlitterNoise)" />
      </svg>

      {TWINKLES.map((s, i) => {
        const style: CSSProperties = {
          top: s.top,
          insetInlineStart: s.start,
          width: s.size,
          height: s.size,
          color: i % 2 === 0 ? "var(--booth-magenta)" : "var(--booth-chrome-1)",
          animationDelay: `${s.delay}s`,
          filter: "drop-shadow(0 0 4px currentColor)",
        };
        return <Sparkles key={i} className="absolute animate-sparkle-flicker" style={style} />;
      })}
    </div>
  );
}
