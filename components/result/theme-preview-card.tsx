"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { renderThemePreview } from "@/lib/decor/theme-preview";
import { seedFrom } from "@/lib/decor/strip-pieces";
import type { ThemeDef } from "@/lib/themes";

interface ThemePreviewCardProps {
  theme: ThemeDef;
  label: string;
  active: boolean;
  onClick: () => void;
}

/** A miniature real render of a theme's strip — background, frame, and a couple of its own decoration pieces — so the browser communicates the theme before it's selected. */
export function ThemePreviewCard({ theme, label, active, onClick }: ThemePreviewCardProps) {
  // Canvas-drawn, so only ever computed client-side (never during SSR).
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const canvas = renderThemePreview(theme, seedFrom(theme.id, "preview"));
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [theme]);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "facet-sm flex w-24 shrink-0 flex-col items-center gap-1.5 border-2 p-1.5 transition-transform active:scale-95",
        active ? "border-accent bg-accent/10" : "border-line/30 bg-panel hover:border-line/60",
      )}
    >
      <span className="flex h-[124px] w-full items-center justify-center overflow-hidden bg-black/10">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- canvas-rendered theme preview, not a photo
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </span>
      <span className="line-clamp-2 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-ink">
        {label}
      </span>
    </button>
  );
}
