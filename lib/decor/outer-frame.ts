import { paintPattern } from "@/lib/decor/patterns";
import type { ThemeColors, ThemeDef } from "@/lib/themes";

/** Draws the theme's outer frame treatment onto `fCanvas`. Reuses whatever Fabric classes the caller already imported (dynamic-imported once per render in lib/strip-renderer.ts). */
export function drawOuterFrame(
  strip: ThemeDef["strip"],
  canvasW: number,
  canvasH: number,
  keyline: string,
  paper: string,
  colors: ThemeColors,
  // Fabric's dynamically-imported classes, typed loosely to avoid re-declaring the whole module surface here.
  fabric: { fCanvas: any; Rect: any; Circle: any; FabricImage: any },
): void {
  const { fCanvas, Rect, Circle, FabricImage } = fabric;
  if (strip.outerFrame.style === "solid") {
    fCanvas.add(
      new Rect({
        left: strip.outerFrame.width / 2,
        top: strip.outerFrame.width / 2,
        width: canvasW - strip.outerFrame.width,
        height: canvasH - strip.outerFrame.width,
        fill: "transparent",
        stroke: keyline,
        strokeWidth: strip.outerFrame.width,
        selectable: false,
        evented: false,
      }),
    );
  } else if (strip.outerFrame.style === "dashed") {
    fCanvas.add(
      new Rect({
        left: strip.outerFrame.width,
        top: strip.outerFrame.width,
        width: canvasW - strip.outerFrame.width * 2,
        height: canvasH - strip.outerFrame.width * 2,
        fill: "transparent",
        stroke: keyline,
        strokeWidth: strip.outerFrame.width * 0.6,
        strokeDashArray: [strip.outerFrame.width * 1.6, strip.outerFrame.width],
        selectable: false,
        evented: false,
      }),
    );
  } else if (strip.outerFrame.style === "chrome") {
    const w = strip.outerFrame.width;
    fCanvas.add(
      new Rect({
        left: w / 2,
        top: w / 2,
        width: canvasW - w,
        height: canvasH - w,
        fill: "transparent",
        stroke: "#8b9096",
        strokeWidth: w,
        selectable: false,
        evented: false,
      }),
    );
    fCanvas.add(
      new Rect({
        left: w * 0.85,
        top: w * 0.85,
        width: canvasW - w * 1.7,
        height: canvasH - w * 1.7,
        fill: "transparent",
        stroke: "#f4f6f8",
        strokeWidth: Math.max(1.5, w * 0.22),
        selectable: false,
        evented: false,
      }),
    );
  } else if (strip.outerFrame.style === "ticket") {
    // A card outline plus a repeating small perforation line along every
    // edge — adapts the same circle-stamp technique "scallop" uses in
    // lib/strip-renderer.ts, at a smaller, denser scale so it reads as
    // punched holes, not bites.
    const w = strip.outerFrame.width;
    fCanvas.add(
      new Rect({
        left: w / 2,
        top: w / 2,
        width: canvasW - w,
        height: canvasH - w,
        fill: "transparent",
        stroke: keyline,
        strokeWidth: Math.max(2, w * 0.3),
        selectable: false,
        evented: false,
      }),
    );
    const r = w * 0.35;
    const step = r * 2.4;
    const addPerforation = (x: number, y: number) =>
      fCanvas.add(new Circle({ left: x - r, top: y - r, radius: r, fill: paper, selectable: false, evented: false }));
    for (let x = w; x <= canvasW - w; x += step) {
      addPerforation(x, w);
      addPerforation(x, canvasH - w);
    }
    for (let y = w; y <= canvasH - w; y += step) {
      addPerforation(w, y);
      addPerforation(canvasW - w, y);
    }
  } else if (strip.outerFrame.style === "airmail") {
    // A diagonal red/navy striped band around every edge, reusing the
    // existing stripes-diagonal pattern rather than a bespoke drawing.
    const w = strip.outerFrame.width;
    const bandTile = document.createElement("canvas");
    bandTile.width = canvasW;
    bandTile.height = canvasH;
    const bandCtx = bandTile.getContext("2d");
    if (bandCtx) {
      paintPattern(bandCtx, { x: 0, y: 0, w: canvasW, h: canvasH }, "stripes-diagonal", colors.accent, colors.accent2, 1.2);
      bandCtx.save();
      bandCtx.globalCompositeOperation = "destination-out";
      bandCtx.fillRect(w, w, Math.max(0, canvasW - w * 2), Math.max(0, canvasH - w * 2));
      bandCtx.restore();
      fCanvas.add(new FabricImage(bandTile, { left: 0, top: 0, selectable: false, evented: false }));
    }
  }
}
