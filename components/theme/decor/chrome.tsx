import { Battery, Circle, Sparkles } from "lucide-react";
import type { ThemeDecorSet } from "@/components/theme/theme-decor";

/**
 * The app's one unified chrome/neon decoration set — dark, glossy, hot-pink
 * glow. Used on every screen regardless of which strip theme is selected
 * (the strip THEME still changes the photo strip's own look; the app shell
 * around it is now a single consistent identity).
 */

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

function ChromeCorners() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="chrome-bevel absolute left-0 top-0 h-1.5 w-16 neon-edge" />
      <div className="chrome-bevel absolute bottom-0 right-0 h-1.5 w-16 neon-edge" />
    </div>
  );
}

function SparkleField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
      <Sparkles className="absolute left-[6%] top-[14%] h-4 w-4 text-accent" />
      <Sparkles className="absolute right-[8%] top-[22%] h-3 w-3 text-accent2" />
      <Sparkles className="absolute bottom-[16%] left-[10%] h-3 w-3 text-accent2" />
    </div>
  );
}

function Hud() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between font-body text-[10px] font-bold tracking-widest text-white/90"
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
      <ChromeCorners />
      <SparkleField />
    </>
  ),
  Camera: () => (
    <>
      <Hud />
      <ScanlineOverlay />
    </>
  ),
  Panel: () => <ChromeCorners />,
};
