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

const BTN = "facet-sm flex h-8 w-8 items-center justify-center border-2 border-line bg-panel text-ink hover:bg-accent hover:text-white active:scale-95";

export function StickerToolbar({ box, onDuplicate, onForward, onBackward, onDelete }: StickerToolbarProps) {
  const { t } = useLanguage();

  return (
    <div
      className="facet-sm pointer-events-auto absolute z-30 flex -translate-y-full gap-1 border-2 border-accent bg-panel p-1 shadow-[0_0_16px_rgb(var(--accent)/0.6)]"
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
