"use client";

import { Copy, ChevronsUp, ChevronsDown, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { SelectionBox } from "@/components/result/sticker-canvas";

interface StickerToolbarProps {
  box: SelectionBox;
  onDuplicate: () => void;
  onForward: () => void;
  onBackward: () => void;
  onDelete: () => void;
}

const BTN = "flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-panel text-ink hover:bg-accent hover:text-white active:scale-95";

export function StickerToolbar({ box, onDuplicate, onForward, onBackward, onDelete }: StickerToolbarProps) {
  const { t } = useLanguage();

  return (
    <div
      className="pointer-events-auto absolute z-30 flex -translate-y-full gap-1 rounded-full border-2 border-ink bg-panel p-1 shadow-[3px_3px_0_0_rgb(var(--ink))]"
      style={{ left: box.left + box.width / 2, top: box.top - 10, transform: "translate(-50%, -100%)" }}
    >
      <button type="button" className={BTN} title={t.result.duplicate} onClick={onDuplicate}>
        <Copy className="h-4 w-4" />
      </button>
      <button type="button" className={BTN} title={t.result.forward} onClick={onForward}>
        <ChevronsUp className="h-4 w-4" />
      </button>
      <button type="button" className={BTN} title={t.result.backward} onClick={onBackward}>
        <ChevronsDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`${BTN} hover:bg-red-600`}
        title={t.result.delete}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
