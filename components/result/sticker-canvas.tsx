"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { stripDimensions } from "@/lib/strip-renderer";
import { svgToDataUrl } from "@/lib/decor/stickers";
import { loadHtmlImage } from "@/lib/decor/load-image";
import type { StickerInstance, StickerKind, StripThemeId } from "@/types";

export interface StickerCanvasHandle {
  addSticker: (kind: StickerKind, content: string) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  bringForwardSelected: () => void;
  sendBackwardSelected: () => void;
}

export interface SelectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface StickerCanvasProps {
  themeId: StripThemeId;
  backgroundUrl: string;
  stickers: StickerInstance[];
  onStickersChange: (next: StickerInstance[]) => void;
  onSelectionChange: (box: SelectionBox | null) => void;
}

const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

/**
 * The live, touch-friendly sticker editor. Hosts a Fabric.js interactive
 * canvas: `backgroundUrl` (the themed strip render, no stickers baked in)
 * sits underneath, user-placed stickers are interactive Fabric objects on
 * top. Fabric's own selection/drag/resize/rotate handles are reused rather
 * than hand-rolled gesture code — they already support touch.
 *
 * Fabric is the live source of truth while editing; every mutation is
 * mirrored back to `onStickersChange` immediately after, so React state
 * (used for export) never drifts from what's on screen.
 */
export const StickerCanvas = forwardRef<StickerCanvasHandle, StickerCanvasProps>(
  function StickerCanvas({ themeId, backgroundUrl, stickers, onStickersChange, onSelectionChange }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const elRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<import("fabric").Canvas | null>(null);
    const [ready, setReady] = useState(false);
    const dims = stripDimensions(themeId);

    // Create the canvas once per theme (dimensions depend on the theme).
    useEffect(() => {
      let disposed = false;
      let canvas: import("fabric").Canvas | null = null;

      (async () => {
        const { Canvas } = await import("fabric");
        if (disposed || !elRef.current) return;

        canvas = new Canvas(elRef.current, {
          width: dims.width,
          height: dims.height,
          selection: false,
          preserveObjectStacking: true,
        });
        fabricRef.current = canvas;

        // Responsive: internal resolution stays logical (matches the
        // exporter's coordinate space); CSS scales it down to fit.
        canvas.wrapperEl.style.width = "100%";
        canvas.wrapperEl.style.maxWidth = `${dims.width}px`;
        canvas.wrapperEl.style.height = "auto";
        canvas.upperCanvasEl.style.width = "100%";
        canvas.upperCanvasEl.style.height = "auto";
        canvas.lowerCanvasEl.style.width = "100%";
        canvas.lowerCanvasEl.style.height = "auto";

        const syncFromCanvas = () => {
          const objects = canvas!.getObjects();
          const next: StickerInstance[] = objects
            .filter((o) => o.get("stickerId"))
            .map((o, index) => ({
              id: o.get("stickerId") as string,
              kind: o.get("stickerKind") as StickerKind,
              content: o.get("stickerContent") as string,
              x: o.left ?? 0,
              y: o.top ?? 0,
              scale: o.scaleX ?? 1,
              angle: o.angle ?? 0,
              z: index,
            }));
          onStickersChange(next);
        };

        canvas.on("object:modified", syncFromCanvas);
        canvas.on("object:removed", syncFromCanvas);
        canvas.on("selection:created", (e) => reportSelection(canvas!, e));
        canvas.on("selection:updated", (e) => reportSelection(canvas!, e));
        canvas.on("selection:cleared", () => onSelectionChange(null));

        // Seed existing stickers.
        for (const sticker of [...stickers].sort((a, b) => a.z - b.z)) {
          // eslint-disable-next-line no-await-in-loop
          await addFabricSticker(canvas, sticker);
        }

        setReady(true);
      })();

      return () => {
        disposed = true;
        canvas?.dispose();
        fabricRef.current = null;
        setReady(false);
      };
      // Only recreate when the theme changes (its canvas dimensions differ).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeId]);

    // Background image swaps whenever the render (filter/theme/caption/etc) changes.
    useEffect(() => {
      if (!ready || !backgroundUrl) return;
      const canvas = fabricRef.current;
      if (!canvas) return;
      (async () => {
        const { FabricImage } = await import("fabric");
        try {
          const img = await loadHtmlImage(backgroundUrl);
          const bg = new FabricImage(img, { selectable: false, evented: false });
          canvas.backgroundImage = bg;
          canvas.renderAll();
        } catch {
          // background failed to load — keep the previous frame rather than blanking.
        }
      })();
    }, [backgroundUrl, ready]);

    useImperativeHandle(
      ref,
      () => ({
        addSticker: (kind, content) => {
          const canvas = fabricRef.current;
          if (!canvas) return;
          const maxZ = stickers.reduce((m, s) => Math.max(m, s.z), -1);
          // Cascade placement so stickers added back-to-back land visibly
          // apart instead of stacking on top of each other.
          const cascade = stickers.length % 6;
          void addFabricSticker(canvas, {
            id: `sticker-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
            kind,
            content,
            x: dims.width * 0.3 + cascade * 34 + (Math.random() * 20 - 10),
            y: dims.height * 0.18 + cascade * 46 + (Math.random() * 20 - 10),
            scale: kind === "emoji" ? 1 : 1.4,
            angle: 0,
            z: maxZ + 1,
          }).then(() => {
            const objects = canvas.getObjects().filter((o: unknown) => (o as { get: (k: string) => unknown }).get("stickerId"));
            const added = objects[objects.length - 1];
            if (added) {
              canvas.setActiveObject(added);
              canvas.renderAll();
            }
            syncNow(canvas, onStickersChange);
          });
        },
        duplicateSelected: () => {
          const canvas = fabricRef.current;
          const active = canvas?.getActiveObject();
          if (!canvas || !active || !active.get("stickerId")) return;
          void active.clone().then((cloned: import("fabric").FabricObject) => {
            cloned.set({
              left: (active.left ?? 0) + 18,
              top: (active.top ?? 0) + 18,
              stickerId: `sticker-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
              stickerKind: active.get("stickerKind"),
              stickerContent: active.get("stickerContent"),
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            syncNow(canvas, onStickersChange);
          });
        },
        deleteSelected: () => {
          const canvas = fabricRef.current;
          const active = canvas?.getActiveObject();
          if (!canvas || !active) return;
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
          onSelectionChange(null);
          syncNow(canvas, onStickersChange);
        },
        bringForwardSelected: () => {
          const canvas = fabricRef.current;
          const active = canvas?.getActiveObject();
          if (!canvas || !active) return;
          canvas.bringObjectToFront(active);
          canvas.renderAll();
          syncNow(canvas, onStickersChange);
        },
        sendBackwardSelected: () => {
          const canvas = fabricRef.current;
          const active = canvas?.getActiveObject();
          if (!canvas || !active) return;
          canvas.sendObjectToBack(active);
          canvas.renderAll();
          syncNow(canvas, onStickersChange);
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [dims.width, dims.height],
    );

    function reportSelection(_canvas: import("fabric").Canvas, e: { selected?: import("fabric").FabricObject[] }) {
      const obj = e.selected?.[0];
      if (!obj || !elRef.current) return onSelectionChange(null);
      const rect = obj.getBoundingRect();
      // The canvas renders at `dims.width` logical px but is CSS-scaled to
      // fit its container — convert the selection box into the same CSS
      // pixels the floating toolbar (an absolutely-positioned HTML overlay
      // sharing the same top-left origin) is drawn in.
      const displayWidth = elRef.current.getBoundingClientRect().width;
      const cssScale = displayWidth / dims.width;
      onSelectionChange({
        left: rect.left * cssScale,
        top: rect.top * cssScale,
        width: rect.width * cssScale,
        height: rect.height * cssScale,
      });
    }

    return (
      <div ref={wrapRef} className="w-full" style={{ maxWidth: dims.width }}>
        <canvas ref={elRef} />
      </div>
    );
  },
);

async function addFabricSticker(canvas: import("fabric").Canvas, sticker: StickerInstance): Promise<void> {
  const { FabricImage, FabricText } = await import("fabric");
  const common = {
    left: sticker.x,
    top: sticker.y,
    originX: "center" as const,
    originY: "center" as const,
    angle: sticker.angle,
    hasControls: true,
    hasBorders: true,
    selectable: true,
  };

  if (sticker.kind === "emoji") {
    const text = new FabricText(sticker.content, {
      ...common,
      fontSize: 64,
      fontFamily: EMOJI_FONT,
      scaleX: sticker.scale,
      scaleY: sticker.scale,
    });
    text.set({ stickerId: sticker.id, stickerKind: "emoji", stickerContent: sticker.content });
    lockUniform(text);
    canvas.add(text);
    canvas.renderAll();
    return;
  }

  try {
    const img = await loadHtmlImage(svgToDataUrl(sticker.content));
    // Fall back to the SVG's own 64x64 viewBox if the browser somehow still
    // reports no natural size — never let a sticker render as a 0x0 object.
    const width = img.naturalWidth || img.width || 64;
    const height = img.naturalHeight || img.height || 64;
    const fabricImg = new FabricImage(img, {
      ...common,
      width,
      height,
      scaleX: sticker.scale,
      scaleY: sticker.scale,
      objectCaching: false,
    });
    fabricImg.set({ stickerId: sticker.id, stickerKind: "svg", stickerContent: sticker.content });
    lockUniform(fabricImg);
    canvas.add(fabricImg);
    canvas.renderAll();
  } catch {
    // skip stickers that fail to load rather than breaking the whole editor
  }
}

function lockUniform(obj: import("fabric").FabricObject): void {
  obj.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false });
  obj.lockScalingFlip = true;
}

function syncNow(canvas: import("fabric").Canvas, onStickersChange: (next: StickerInstance[]) => void): void {
  const objects = canvas.getObjects();
  const next: StickerInstance[] = objects
    .filter((o) => o.get("stickerId"))
    .map((o, index) => ({
      id: o.get("stickerId") as string,
      kind: o.get("stickerKind") as StickerKind,
      content: o.get("stickerContent") as string,
      x: o.left ?? 0,
      y: o.top ?? 0,
      scale: o.scaleX ?? 1,
      angle: o.angle ?? 0,
      z: index,
    }));
  onStickersChange(next);
}
