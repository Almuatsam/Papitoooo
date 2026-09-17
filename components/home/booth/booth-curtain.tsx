"use client";

/**
 * Builds a vertical wavy line (alternating quadratic-bezier bulges left and
 * right) — a fabric "fold" centerline, not a straight bar.
 */
function wavyPath(x: number, height: number, amplitude: number, wavelength: number): string {
  let d = `M ${x} 0`;
  let y = 0;
  let dir = 1;
  while (y < height) {
    const endY = Math.min(y + wavelength, height);
    const midY = (y + endY) / 2;
    d += ` Q ${x + amplitude * dir} ${midY} ${x} ${endY}`;
    dir *= -1;
    y = endY;
  }
  return d;
}

const VIEW_HEIGHT = 200;
const FOLD_COUNT = 11;
const FOLDS = Array.from({ length: FOLD_COUNT }, (_, i) => {
  const x = ((i + 0.5) / FOLD_COUNT) * 100;
  return {
    d: wavyPath(x, VIEW_HEIGHT, 3.2, 26),
    stroke: i % 2 === 0 ? "var(--booth-chrome-3)" : "var(--booth-chrome-2)",
  };
});
const CENTER_SEAM = wavyPath(50, VIEW_HEIGHT, 4, 26);

/**
 * A hanging curtain of soft wavy fabric folds — fills the entrance zone it's
 * placed in (see BoothCabinet), traced from reference #6's curtained
 * doorway. Previously this was straight stripe bars, which read as a
 * barcode rather than fabric.
 */
export function BoothCurtain() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-x-1 top-1 z-10 h-1.5" style={{ background: "var(--booth-chrome-1)" }} />
      <svg viewBox={`0 0 100 ${VIEW_HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
        <rect x="0" y="0" width="100" height={VIEW_HEIGHT} fill="var(--booth-bg-alt)" />
        {FOLDS.map((f, i) => (
          <path key={i} d={f.d} fill="none" stroke={f.stroke} strokeWidth="1.8" opacity="0.85" />
        ))}
        <path d={CENTER_SEAM} fill="none" stroke="var(--booth-magenta)" strokeWidth="1.2" opacity="0.9" />
      </svg>
    </div>
  );
}
