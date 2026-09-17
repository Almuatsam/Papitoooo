"use client";

import type { ReactNode } from "react";

/**
 * The cabinet body, split into the two zones reference #6 actually shows:
 * a "featured strip" display panel (strip preview + coin slot) and a
 * curtained entrance (stool + enter button) — a wall divider between them,
 * not everything floating loose in one column.
 */
export function BoothCabinet({
  display,
  entrance,
  mirror,
}: {
  display: ReactNode;
  entrance: ReactNode;
  mirror: ReactNode;
}) {
  return (
    <div className="relative z-10 flex h-64 w-full sm:h-72">
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 border-e-2 px-3 py-4"
        style={{ borderColor: "var(--booth-chrome-3)" }}
      >
        {display}
      </div>
      <div className="isolate relative flex flex-[1.3] flex-col items-center justify-center gap-3 overflow-hidden px-3 py-4">
        {entrance}
      </div>
      <div
        className="flex w-8 items-center justify-center border-s-2 sm:w-10"
        style={{ borderColor: "var(--booth-chrome-3)" }}
      >
        {mirror}
      </div>
    </div>
  );
}
