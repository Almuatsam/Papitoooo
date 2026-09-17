"use client";

import type { ReactNode } from "react";

/**
 * The marquee sign box sitting on top of the cabinet — a bordered panel on
 * two support struts, traced from reference #6's "PHOTOBOOTH" sign-on-legs,
 * rather than just floating glow text with no structure around it.
 */
export function BoothSign({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex w-full flex-col items-center">
      <div
        className="facet-sm w-[58%] border-2 px-3 py-1.5"
        style={{
          borderColor: "var(--booth-chrome-1)",
          background: "var(--booth-bg-alt)",
          boxShadow: "0 0 20px var(--booth-magenta-glow)",
        }}
      >
        {children}
      </div>
      <div className="flex gap-8">
        <span className="h-4 w-1.5" style={{ background: "var(--booth-chrome-2)" }} />
        <span className="h-4 w-1.5" style={{ background: "var(--booth-chrome-2)" }} />
      </div>
    </div>
  );
}
