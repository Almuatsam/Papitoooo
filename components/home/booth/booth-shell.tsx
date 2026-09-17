"use client";

import type { ReactNode } from "react";
import { BoothCanopy } from "@/components/home/booth/booth-canopy";

/**
 * Outer dark faceted cabinet frame for the literal photo-booth hero. Carries
 * its own scoped token set (`--booth-*`, defined in app/globals.css under
 * `.booth-hero`) instead of the app-wide `--paper`/`--accent` tokens the
 * rest of the app uses — this hero is meant to read as a lit booth cabinet,
 * deliberately distinct from the rest of the app's identity.
 *
 * `sign` and `<BoothCanopy>` are stacked with zero gap so the marquee sign,
 * its support legs, and the roofline read as one continuous structure sitting
 * on top of the cabinet — not three disconnected pieces. `topBar` is page-level
 * chrome (theme/layout/language switches), rendered above the cabinet object
 * entirely rather than competing with the sign for the same space.
 */
export function BoothShell({
  topBar,
  sign,
  children,
}: {
  topBar: ReactNode;
  sign: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="booth-hero relative flex flex-1 items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-x-0 top-4 z-20 px-4 sm:top-6">{topBar}</div>

      <div className="flex w-full max-w-sm flex-col items-center">
        {sign}
        <BoothCanopy />
        <div className="booth-shell facet relative -mt-px flex w-full flex-col items-center gap-4 overflow-hidden px-4 pb-6 pt-6 text-center">
          {children}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2" style={{ background: "var(--booth-chrome-2)" }} />
        </div>
      </div>
    </div>
  );
}
