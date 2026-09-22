/**
 * A small, static maker credit — deliberately not a brand element. Fixed to
 * the viewport so it shows identically on every screen (home, camera,
 * result), muted and low-opacity so it never competes with real UI (the
 * Home/Result screens already put decorative glitter accents at the
 * bottom-end corner — see ChromeDecor's `GlitterCorners` — so this sits at
 * the bottom-start corner instead, which every screen leaves clear).
 */
export function CreditTag() {
  return (
    <span className="pointer-events-none fixed bottom-2 start-2 z-40 select-none text-[10px] leading-none text-muted opacity-50">
      EstudioA.dev
    </span>
  );
}
