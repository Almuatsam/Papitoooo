import { SparkleShape, StarShape, HeartShape } from "@/lib/decor/shapes";
import type { ThemeDecorSet } from "@/components/theme/theme-decor";

function Tape({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute h-6 w-16 rotate-[-8deg] bg-accent2/70 shadow-sm animate-flutter ${className ?? ""}`}
    />
  );
}

function Doodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80">
      <SparkleShape className="absolute left-[8%] top-[12%] h-6 w-6 text-accent" />
      <StarShape className="absolute right-[10%] top-[20%] h-5 w-5 text-accent2" />
      <HeartShape className="absolute bottom-[15%] left-[12%] h-5 w-5 text-accent" />
      <SparkleShape className="absolute bottom-[10%] right-[14%] h-5 w-5 text-accent2" />
    </div>
  );
}

export const GlitterScrapbookDecor: ThemeDecorSet = {
  Home: () => (
    <>
      <Doodles />
      <Tape className="left-4 top-4" />
      <Tape className="bottom-6 right-6 rotate-[10deg]" />
    </>
  ),
  Camera: () => (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      <Tape className="-left-2 -top-2 rotate-[-14deg]" />
      <Tape className="-right-2 -top-2 rotate-[14deg]" />
    </div>
  ),
  Panel: () => <Doodles />,
};
