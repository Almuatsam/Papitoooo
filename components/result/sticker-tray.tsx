"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { stickersByCollection, svgToDataUrl } from "@/lib/decor/stickers";
import { mulberry32, seedFrom } from "@/lib/decor/strip-pieces";
import { textureDataUrl } from "@/lib/decor/textures";
import type { StripThemeId } from "@/types";

/** Deterministic per-sticker rotation/scale so the tray reads as a scattered
 * supply of physical pieces, not a uniform icon grid — stable across
 * re-renders since it's seeded by the sticker's own id, not randomised live. */
function trayJitter(id: string): { rotate: number; scale: number } {
  const rand = mulberry32(seedFrom(id, "tray"));
  return { rotate: (rand() * 2 - 1) * 10, scale: 0.9 + rand() * 0.22 };
}

interface StickerTrayProps {
  /** Every theme owns exactly one dedicated sticker pack — no tabs needed. */
  themeId: StripThemeId;
  onAddSvg: (svg: string) => void;
  onAddEmoji: (emoji: string) => void;
}

export function StickerTray({ themeId, onAddSvg, onAddEmoji }: StickerTrayProps) {
  const { t } = useLanguage();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiValue, setEmojiValue] = useState("");
  const emojiInputRef = useRef<HTMLInputElement>(null);
  // Canvas-drawn, so only ever computed client-side (never during SSR).
  const [trayTexture, setTrayTexture] = useState("");
  const stickers = useMemo(() => stickersByCollection(themeId), [themeId]);

  useEffect(() => {
    if (emojiOpen) emojiInputRef.current?.focus();
  }, [emojiOpen]);

  useEffect(() => {
    setTrayTexture(textureDataUrl("paper", "#ffffff", "#ffffff", 2));
  }, []);

  const commitEmoji = () => {
    const value = emojiValue.trim();
    if (value) onAddEmoji(value);
    setEmojiValue("");
    setEmojiOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        {!emojiOpen ? (
          <button
            type="button"
            onClick={() => setEmojiOpen(true)}
            className="facet-sm shrink-0 inline-flex items-center gap-1 border-2 border-line bg-panel px-3 py-1 text-xs font-bold"
          >
            <Smile className="h-3.5 w-3.5" />
            {t.result.addEmoji}
          </button>
        ) : (
          <input
            ref={emojiInputRef}
            value={emojiValue}
            onChange={(e) => setEmojiValue(e.target.value)}
            onBlur={commitEmoji}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEmoji();
              if (e.key === "Escape") {
                setEmojiValue("");
                setEmojiOpen(false);
              }
            }}
            placeholder={t.result.emojiHint}
            className="facet-sm w-40 shrink-0 border-2 border-line bg-panel px-3 py-1 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          />
        )}
      </div>

      {/* "Supply tray" surface: faint paper grain + a grid that lets each
          piece tilt/scale past its own cell instead of sitting in a uniform
          icon-grid box. The button (the actual touch target) stays a
          consistent size; only the inner artwork wrapper transforms. */}
      <div
        className="facet-sm grid grid-cols-5 gap-2 overflow-visible border-2 border-line/20 bg-panel/60 p-2 sm:grid-cols-6"
        style={trayTexture ? { backgroundImage: `url(${trayTexture})` } : undefined}
      >
        {stickers.map((sticker) => {
          const jitter = trayJitter(sticker.id);
          return (
            <button
              key={sticker.id}
              type="button"
              title={sticker.label}
              onClick={() => onAddSvg(sticker.svg)}
              className="relative flex aspect-square items-center justify-center overflow-visible transition-transform active:scale-90"
            >
              <span
                className="absolute inset-0 flex items-center justify-center transition-transform hover:scale-110"
                style={{ transform: `rotate(${jitter.rotate.toFixed(1)}deg) scale(${jitter.scale.toFixed(2)})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG sticker artwork, not a photo */}
                <img src={svgToDataUrl(sticker.svg)} alt={sticker.label} className="h-full w-full drop-shadow-md" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
