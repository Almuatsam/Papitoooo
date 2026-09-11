import { Battery, Circle, Sparkles } from "lucide-react";
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
  left: string;
  size: number;
  color: "accent" | "accent2" | "white";
  rotate: number;
  delay: number;
}

const SPARKLES: Sparkle[] = [
  { top: "8%", left: "6%", size: 22, color: "accent", rotate: -10, delay: 0 },
  { top: "16%", left: "88%", size: 14, color: "accent2", rotate: 20, delay: 0.4 },
  { top: "6%", left: "45%", size: 10, color: "white", rotate: 5, delay: 0.9 },
  { top: "26%", left: "18%", size: 12, color: "accent2", rotate: -25, delay: 1.3 },
  { top: "34%", left: "78%", size: 18, color: "accent", rotate: 15, delay: 0.2 },
  { top: "48%", left: "8%", size: 16, color: "white", rotate: -15, delay: 1.7 },
  { top: "58%", left: "92%", size: 10, color: "accent", rotate: 30, delay: 0.6 },
  { top: "68%", left: "30%", size: 14, color: "accent2", rotate: -8, delay: 1.1 },
  { top: "74%", left: "70%", size: 20, color: "white", rotate: 12, delay: 0.3 },
  { top: "84%", left: "12%", size: 12, color: "accent", rotate: -20, delay: 1.5 },
  { top: "90%", left: "60%", size: 16, color: "accent2", rotate: 8, delay: 0.8 },
  { top: "40%", left: "50%", size: 9, color: "white", rotate: -30, delay: 1.9 },
];

const COLOR_CLASS: Record<Sparkle["color"], string> = {
  accent: "text-accent",
  accent2: "text-accent2",
  white: "text-white",
};

function SparkleField() {
  // Fixed to the viewport (not the section it's called from) so it reads as
  // one ambient layer of glitter regardless of how tall/scrollable the
  // screen underneath is (the Result screen in particular).
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {SPARKLES.map((s, i) => (
        <Sparkles
          key={i}
          className={`absolute animate-shimmer ${COLOR_CLASS[s.color]}`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            transform: `rotate(${s.rotate}deg)`,
            animationDelay: `${s.delay}s`,
            filter: "drop-shadow(0 0 4px currentColor)",
          }}
        />
      ))}
    </div>
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
      <div className="glitter-bar absolute left-0 top-0 h-1.5 w-20" />
      <Sparkles className="absolute left-1 top-2.5 h-3.5 w-3.5 text-white" style={{ filter: "drop-shadow(0 0 4px currentColor)" }} />
      <div className="glitter-bar absolute bottom-0 right-0 h-1.5 w-20" />
      <Sparkles className="absolute bottom-2.5 right-1 h-3.5 w-3.5 text-white" style={{ filter: "drop-shadow(0 0 4px currentColor)" }} />
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
      <GlitterCorners />
      <SparkleField />
    </>
  ),
};
