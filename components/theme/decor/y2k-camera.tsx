import { Battery, Circle } from "lucide-react";
import type { ThemeDecorSet } from "@/components/theme/theme-decor";

function ScanlineOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, #000 0 1px, transparent 1px 4px)",
      }}
    />
  );
}

function Hud() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center justify-between font-space-mono text-[10px] font-bold tracking-widest text-white/90"
    >
      <span className="flex items-center gap-1 rounded bg-black/35 px-1.5 py-0.5">
        <Circle className="h-2 w-2 fill-accent text-accent animate-pixel-blink" /> REC
      </span>
      <span className="flex items-center gap-1 rounded bg-black/35 px-1.5 py-0.5">
        <Battery className="h-3 w-3" /> 87%
      </span>
    </div>
  );
}

function ChromeCorners() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70">
      <div className="chrome-bevel absolute left-0 top-0 h-2 w-16 rounded-br-lg" />
      <div className="chrome-bevel absolute bottom-0 right-0 h-2 w-16 rounded-tl-lg" />
    </div>
  );
}

export const Y2kCameraDecor: ThemeDecorSet = {
  Home: () => (
    <>
      <ScanlineOverlay />
      <ChromeCorners />
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
