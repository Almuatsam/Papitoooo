import type { ThemeDecorSet } from "@/components/theme/theme-decor";

function ColorBlock() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 bg-accent2/90"
    />
  );
}

function Halftone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute h-16 w-16 rounded-full opacity-70 ${className ?? ""}`}
      style={{
        backgroundImage: "radial-gradient(currentColor 22%, transparent 24%)",
        backgroundSize: "7px 7px",
        color: "rgb(var(--ink))",
      }}
    />
  );
}

function CoverBadge() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-3 top-3 z-20 flex h-14 w-14 rotate-[10deg] items-center justify-center rounded-full border-2 border-ink bg-accent text-center text-[9px] font-black leading-tight text-white"
    >
      NO. 01
    </div>
  );
}

export const PopMagazineDecor: ThemeDecorSet = {
  Home: () => (
    <>
      <ColorBlock />
      <Halftone className="bottom-8 left-4" />
    </>
  ),
  Camera: () => <CoverBadge />,
  Panel: () => <Halftone className="bottom-2 right-2 h-12 w-12" />,
};
