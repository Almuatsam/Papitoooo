import { StarShape, HeartShape } from "@/lib/decor/shapes";
import type { ThemeDecorSet } from "@/components/theme/theme-decor";

function CheckerCorner({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute h-8 w-8 ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(45deg, rgb(var(--ink)) 25%, transparent 25%), linear-gradient(-45deg, rgb(var(--ink)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(var(--ink)) 75%), linear-gradient(-45deg, transparent 75%, rgb(var(--ink)) 75%)",
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
        opacity: 0.5,
      }}
    />
  );
}

function MarqueeBorder() {
  return <div aria-hidden className="marquee-border pointer-events-none absolute inset-x-0 top-0 h-[3px] animate-marquee" />;
}

function PixelBits() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80">
      <StarShape className="absolute left-[10%] top-[70%] h-3 w-3 text-accent2 animate-pixel-blink" />
      <HeartShape className="absolute right-[12%] top-[15%] h-3 w-3 text-accent animate-pixel-blink" />
    </div>
  );
}

export const RetroInternetDecor: ThemeDecorSet = {
  Home: () => (
    <>
      <MarqueeBorder />
      <CheckerCorner className="left-2 top-2" />
      <CheckerCorner className="bottom-2 right-2" />
      <PixelBits />
    </>
  ),
  Camera: () => (
    <>
      <MarqueeBorder />
      <div aria-hidden className="marquee-border pointer-events-none absolute inset-x-0 bottom-0 h-[3px] animate-marquee" />
    </>
  ),
  Panel: () => (
    <>
      <CheckerCorner className="left-1 top-1 h-5 w-5" />
      <CheckerCorner className="bottom-1 right-1 h-5 w-5" />
    </>
  ),
};
