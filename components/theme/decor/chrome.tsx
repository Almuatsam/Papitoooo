import { Battery, Circle, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import type { ThemeDecorSet } from "@/components/theme/theme-decor";

/**
 * The app's one unified chrome/neon decoration set — dark, glossy, hot-pink
 * glow, and genuinely glitter-dense (scattered sparkle shapes, not a muted
 * dot texture). Used on every screen regardless of which strip theme is
 * selected (the strip THEME still changes the photo strip's own look; the
 * app shell around it is now a single consistent identity).
 */

interface Sparkle {
  top: string;
  /** Logical inline-start position (mirrors correctly in Arabic/RTL) — never `left`. */
  start: string;
  size: number;
  color: "accent" | "accent2" | "white";
  rotate: number;
  delay: number;
  shape: "sparkle" | "diamond";
  motion: "shimmer" | "flicker";
}

// Deliberately clustered and uneven, not an even grid: a dense pocket top-
// start, a sparser scatter through the middle, a second small cluster
// bottom-end — "intentionally placed", per the brief, rather than spread out.
const SPARKLES: Sparkle[] = [
  { top: "6%", start: "5%", size: 26, color: "accent", rotate: -10, delay: 0, shape: "sparkle", motion: "shimmer" },
  { top: "10%", start: "16%", size: 12, color: "white", rotate: 8, delay: 0.5, shape: "diamond", motion: "flicker" },
  { top: "15%", start: "9%", size: 10, color: "accent2", rotate: 22, delay: 1.1, shape: "sparkle", motion: "flicker" },
  { top: "8%", start: "92%", size: 15, color: "accent2", rotate: 20, delay: 0.4, shape: "sparkle", motion: "shimmer" },
  { top: "22%", start: "82%", size: 9, color: "white", rotate: -18, delay: 1.4, shape: "diamond", motion: "flicker" },
  { top: "38%", start: "22%", size: 11, color: "white", rotate: 5, delay: 0.9, shape: "sparkle", motion: "shimmer" },
  { top: "52%", start: "6%", size: 17, color: "accent", rotate: -25, delay: 1.6, shape: "sparkle", motion: "shimmer" },
  { top: "46%", start: "68%", size: 8, color: "accent2", rotate: 30, delay: 0.7, shape: "diamond", motion: "flicker" },
  { top: "64%", start: "90%", size: 20, color: "white", rotate: 12, delay: 0.2, shape: "sparkle", motion: "shimmer" },
  { top: "70%", start: "80%", size: 10, color: "accent", rotate: -8, delay: 1.2, shape: "sparkle", motion: "flicker" },
  { top: "84%", start: "10%", size: 13, color: "accent2", rotate: 15, delay: 0.6, shape: "sparkle", motion: "shimmer" },
  { top: "90%", start: "18%", size: 9, color: "white", rotate: -30, delay: 1.8, shape: "diamond", motion: "flicker" },
];

const COLOR_CLASS: Record<Sparkle["color"], string> = {
  accent: "text-accent",
  accent2: "text-accent2",
  white: "text-white",
};

// Full literal class names, not built via template-string concatenation —
// Tailwind's content scanner only picks up complete class tokens that appear
// verbatim in the source, so `animate-${x}` would silently generate nothing.
const MOTION_CLASS: Record<Sparkle["motion"], string> = {
  shimmer: "animate-shimmer",
  flicker: "animate-sparkle-flicker",
};

/** A small diamond shape — variety against the repeated sparkle icon so the field doesn't read as one stamped asset. */
function Diamond({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
      <path d="M12 1 L20 12 L12 23 L4 12 Z" />
    </svg>
  );
}

function SparkleField() {
  // Fixed to the viewport (not the section it's called from) so it reads as
  // one ambient layer of glitter regardless of how tall/scrollable the
  // screen underneath is (the Result screen in particular).
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {SPARKLES.map((s, i) => {
        const Shape = s.shape === "diamond" ? Diamond : Sparkles;
        return (
          <Shape
            key={i}
            className={`absolute ${MOTION_CLASS[s.motion]} ${COLOR_CLASS[s.color]}`}
            style={{
              top: s.top,
              insetInlineStart: s.start,
              width: s.size,
              height: s.size,
              transform: `rotate(${s.rotate}deg)`,
              animationDelay: `${s.delay}s`,
              filter: "drop-shadow(0 0 4px currentColor)",
            }}
          />
        );
      })}
    </div>
  );
}

/** A large soft faceted shape sitting behind content for depth — pure CSS, no raster. */
function CornerDepth() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed -bottom-24 -start-24 -z-10 h-72 w-72 animate-pop-in bg-accent/[0.08] blur-2xl"
      style={{ clipPath: "polygon(20% 0, 100% 10%, 90% 100%, 0 85%)" }}
    />
  );
}

/** A diagonal ribbon tag fluttering gently near a corner — reuses the app's tape/ribbon language, no text (stays language-neutral). */
function CornerRibbon() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-10 end-[-14px] z-0 h-6 w-24 origin-center animate-flutter bg-accent2/70"
      style={{ transform: "rotate(38deg)" }}
    />
  );
}

function ScanlineOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)",
      }}
    />
  );
}

function GlitterCorners() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="glitter-bar absolute start-0 top-0 h-1.5 w-20" />
      <Sparkles className="absolute start-1 top-2.5 h-3.5 w-3.5 text-white" style={{ filter: "drop-shadow(0 0 4px currentColor)" }} />
      <div className="glitter-bar absolute bottom-0 end-0 h-1.5 w-20" />
      <Sparkles className="absolute bottom-2.5 end-1 h-3.5 w-3.5 text-white" style={{ filter: "drop-shadow(0 0 4px currentColor)" }} />
    </div>
  );
}

function Hud() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between font-space-mono text-[10px] font-bold tracking-widest text-white/90"
    >
      <span className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5">
        <Circle className="h-2 w-2 fill-accent text-accent animate-pixel-blink" /> REC
      </span>
      <span className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5">
        <Battery className="h-3 w-3" /> 87%
      </span>
    </div>
  );
}

export const ChromeDecor: ThemeDecorSet = {
  Home: () => (
    <>
      <CornerDepth />
      <CornerRibbon />
      <ScanlineOverlay />
      <GlitterCorners />
      <SparkleField />
    </>
  ),
  Camera: () => (
    <>
      <Hud />
      <ScanlineOverlay />
      <SparkleField />
    </>
  ),
  Panel: () => (
    <>
      <CornerDepth />
      <GlitterCorners />
      <SparkleField />
    </>
  ),
};
