import { BowShape, HeartShape, StarShape } from "@/lib/decor/shapes";
import type { ThemeDecorSet } from "@/components/theme/theme-decor";

function BowTopper() {
  return (
    <BowShape
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-2 h-8 w-8 -translate-x-1/2 text-accent animate-bow-bounce"
    />
  );
}

function CornerCharms() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-90">
      <HeartShape className="absolute left-3 top-3 h-5 w-5 text-accent" />
      <StarShape className="absolute right-3 top-3 h-5 w-5 text-accent2" />
      <HeartShape className="absolute bottom-3 right-3 h-4 w-4 text-accent2" />
      <StarShape className="absolute bottom-3 left-3 h-4 w-4 text-accent" />
    </div>
  );
}

export const CuteBoothDecor: ThemeDecorSet = {
  Home: () => (
    <>
      <BowTopper />
      <CornerCharms />
    </>
  ),
  Camera: () => <BowTopper />,
  Panel: () => <CornerCharms />,
};
