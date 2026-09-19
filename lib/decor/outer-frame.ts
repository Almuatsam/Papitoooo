import { paintPattern } from "@/lib/decor/patterns";
import { drawLeopardNineSliceBorder } from "@/lib/decor/assets/leopard-scallop-frame";
import { drawZebraNineSliceBorder } from "@/lib/decor/assets/zebra-frame";
import { drawGlitterNineSliceBorder } from "@/lib/decor/assets/glitter-frame";
import type { ThemeColors, ThemeDef } from "@/lib/themes";

/** Draws the theme's outer frame treatment onto `fCanvas`. Reuses whatever Fabric classes the caller already imported (dynamic-imported once per render in lib/strip-renderer.ts). Async only because "leopard-scallop" loads/processes a real PNG asset; every other style stays synchronous internally. */
export async function drawOuterFrame(
  strip: ThemeDef["strip"],
  canvasW: number,
  canvasH: number,
  keyline: string,
  paper: string,
  colors: ThemeColors,
  // Fabric's dynamically-imported classes, typed loosely to avoid re-declaring the whole module surface here.
  fabric: { fCanvas: any; Rect: any; Circle: any; FabricImage: any },
): Promise<void> {
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
    // A card outline plus one horizontal tear line — a dashed row of
    // punched dots at the boundary between the photos and the bottom
    // "stub" band (barcode + route fields), with a semicircle notch bitten
    // out of the left/right border exactly where the tear line meets it.
    // That notch is what actually reads as "ticket stub", not the dashes.
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

    const tearY = canvasH - strip.bottomPad;
    const dotR = Math.max(2, canvasW * 0.007);
    const dotStep = dotR * 3.2;
    for (let x = w * 1.2; x <= canvasW - w * 1.2; x += dotStep) {
      fCanvas.add(
        new Circle({ left: x - dotR, top: tearY - dotR, radius: dotR, fill: paper, selectable: false, evented: false }),
      );
    }

    const notchR = Math.max(10, canvasW * 0.022);
    fCanvas.add(
      new Circle({ left: -notchR, top: tearY - notchR, radius: notchR, fill: paper, selectable: false, evented: false }),
    );
    fCanvas.add(
      new Circle({
        left: canvasW - notchR,
        top: tearY - notchR,
        radius: notchR,
        fill: paper,
        selectable: false,
        evented: false,
      }),
    );
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
  } else if (strip.outerFrame.style === "leopard-scallop") {
    // The user's real leopard-print artwork (public/decor/leopard-scallop-
    // frame.png), 9-sliced onto a canvas sized to the ACTUAL canvasW/
    // canvasH every render — see lib/decor/assets/leopard-scallop-frame.ts
    // for why that's what makes one fixed piece of art work as a border
    // across every layout without distorting its corners or fur detail.
    try {
      const bandCanvas = document.createElement("canvas");
      bandCanvas.width = canvasW;
      bandCanvas.height = canvasH;
      const bandCtx = bandCanvas.getContext("2d");
      if (bandCtx) {
        await drawLeopardNineSliceBorder(bandCtx, canvasW, canvasH);
        fCanvas.add(new FabricImage(bandCanvas, { left: 0, top: 0, selectable: false, evented: false }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[outer-frame] leopard-scallop border failed, skipping", err);
    }
  } else if (strip.outerFrame.style === "zebra-frame") {
    // The user's real zebra-print artwork (public/decor/zebra-frame.png),
    // 9-sliced onto a canvas sized to the actual canvasW/canvasH every
    // render — see lib/decor/assets/zebra-frame.ts. Simpler than the
    // leopard border: a plain stretched edge on each side, no tiling.
    try {
      const bandCanvas = document.createElement("canvas");
      bandCanvas.width = canvasW;
      bandCanvas.height = canvasH;
      const bandCtx = bandCanvas.getContext("2d");
      if (bandCtx) {
        await drawZebraNineSliceBorder(bandCtx, canvasW, canvasH);
        fCanvas.add(new FabricImage(bandCanvas, { left: 0, top: 0, selectable: false, evented: false }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[outer-frame] zebra-frame border failed, skipping", err);
    }
  } else if (strip.outerFrame.style === "glitter-frame") {
    // The user's real glitter-frame artwork (public/decor/glitter-frame.
    // png), 9-sliced onto a canvas sized to the actual canvasW/canvasH
    // every render — see lib/decor/assets/glitter-frame.ts for the
    // asymmetric-border + one-oversized-corner generalization this needed.
    try {
      const bandCanvas = document.createElement("canvas");
      bandCanvas.width = canvasW;
      bandCanvas.height = canvasH;
      const bandCtx = bandCanvas.getContext("2d");
      if (bandCtx) {
        await drawGlitterNineSliceBorder(bandCtx, canvasW, canvasH);
        fCanvas.add(new FabricImage(bandCanvas, { left: 0, top: 0, selectable: false, evented: false }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[outer-frame] glitter-frame border failed, skipping", err);
    }
  }
}
