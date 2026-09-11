"use client";

import { useState, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { StickerCanvas, type StickerCanvasHandle, type SelectionBox } from "@/components/result/sticker-canvas";
import { StickerToolbar } from "@/components/result/sticker-toolbar";
import type { StickerInstance, StripThemeId } from "@/types";

interface StripPreviewProps {
  themeId: StripThemeId;
  url: string;
  rendering: boolean;
  error: boolean;
  stickers: StickerInstance[];
  onStickersChange: (next: StickerInstance[]) => void;
  canvasRef: RefObject<StickerCanvasHandle>;
}

export function StripPreview({
  themeId,
  url,
  rendering,
  error,
  stickers,
  onStickersChange,
  canvasRef,
}: StripPreviewProps) {
  const { t } = useLanguage();
  const [selection, setSelection] = useState<SelectionBox | null>(null);

  return (
    <div className="relative flex w-full max-w-[320px] flex-col items-center">
      {!url && !error && (
        <div className="flex aspect-[1/3] w-full items-center justify-center border-3 border-dashed border-line">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      )}

      {error && (
        <div className="flex aspect-[1/3] w-full items-center justify-center border-3 border-line p-4 text-center text-sm font-bold uppercase text-muted">
          {t.result.couldNotBuildStrip}
        </div>
      )}

      {url && (
        <div className="neon-edge relative w-full animate-strip-drop">
          <StickerCanvas
            ref={canvasRef}
            themeId={themeId}
            backgroundUrl={url}
            stickers={stickers}
            onStickersChange={onStickersChange}
            onSelectionChange={setSelection}
          />
          {selection && (
            <StickerToolbar
              box={selection}
              onDuplicate={() => canvasRef.current?.duplicateSelected()}
              onForward={() => canvasRef.current?.bringForwardSelected()}
              onBackward={() => canvasRef.current?.sendBackwardSelected()}
              onDelete={() => {
                canvasRef.current?.deleteSelected();
                setSelection(null);
              }}
            />
          )}
        </div>
      )}

      {url && rendering && (
        <div className="absolute end-2 top-2 rounded-full bg-black/70 p-1.5">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        </div>
      )}
    </div>
  );
}
