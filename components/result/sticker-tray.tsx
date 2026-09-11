"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/hooks/use-language";
import { STICKER_COLLECTIONS, stickersByCollection, svgToDataUrl } from "@/lib/decor/stickers";
import type { StickerCollectionId } from "@/lib/decor/stickers";

interface StickerTrayProps {
  onAddSvg: (svg: string) => void;
  onAddEmoji: (emoji: string) => void;
}

export function StickerTray({ onAddSvg, onAddEmoji }: StickerTrayProps) {
  const { t } = useLanguage();
  const [collection, setCollection] = useState<StickerCollectionId>("y2k");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiValue, setEmojiValue] = useState("");
  const emojiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emojiOpen) emojiInputRef.current?.focus();
  }, [emojiOpen]);

  const commitEmoji = () => {
    const value = emojiValue.trim();
    if (value) onAddEmoji(value);
    setEmojiValue("");
    setEmojiOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto py-1">
          {STICKER_COLLECTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCollection(c.id)}
              className={cn(
                "facet-sm shrink-0 border-2 border-line px-3 py-1 text-xs font-bold uppercase tracking-wide",
                collection === c.id ? "bg-accent text-white" : "bg-panel text-ink hover:bg-white/10",
              )}
            >
              {t.stickerCollections[c.id]}
            </button>
          ))}
        </div>

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

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
        {stickersByCollection(collection).map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            title={sticker.label}
            onClick={() => onAddSvg(sticker.svg)}
            className="facet-sm flex aspect-square items-center justify-center border-2 border-line/25 bg-panel p-1.5 transition-transform hover:-translate-y-0.5 hover:border-accent active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG sticker artwork, not a photo */}
            <img src={svgToDataUrl(sticker.svg)} alt={sticker.label} className="h-full w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
