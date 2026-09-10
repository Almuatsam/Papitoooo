"use client";

import { Loader2 } from "lucide-react";

interface StripPreviewProps {
  url: string;
  rendering: boolean;
  error: boolean;
}

export function StripPreview({ url, rendering, error }: StripPreviewProps) {
  return (
    <div className="relative flex w-full max-w-[320px] justify-center">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- canvas-generated data URL; next/image cannot optimize it
        <img
          key={url}
          src={url}
          alt="Your photo strip"
          className="w-full animate-strip-drop border-3 border-ink shadow-[8px_8px_0_0_hsl(var(--ink))]"
        />
      )}

      {!url && !error && (
        <div className="flex aspect-[1/3] w-full items-center justify-center border-3 border-dashed border-line">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      )}

      {error && (
        <div className="flex aspect-[1/3] w-full items-center justify-center border-3 border-ink p-4 text-center text-sm font-bold uppercase text-muted">
          Could not build the strip
        </div>
      )}

      {url && rendering && (
        <div className="absolute right-2 top-2 rounded-full bg-ink p-1.5">
          <Loader2 className="h-4 w-4 animate-spin text-paper" />
        </div>
      )}
    </div>
  );
}
