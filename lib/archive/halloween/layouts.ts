import type { LayoutId } from "@/types";
import type { Box, LayoutDef, PrintSize, TemplateDateBox } from "@/lib/layouts/types";

const BASE = "/themes/halloween";

/** Compact slot constructor: [left, top, width, height]. */
type Slot = readonly [number, number, number, number];

interface TemplateSpec {
  id: LayoutId;
  label: string;
  tagline: string;
  file: string;
  size: readonly [number, number];
  printSize: PrintSize;
  /** Grey-slot rectangles, measured from the artwork's flat #d9d9d9 fill (border excluded, so the lime keyline stays visible). */
  slots: readonly Slot[];
  /** Per-slot index of the captured frame it shows. Omitted = one frame per slot. Used by double prints so both copies are the same shot. */
  slotFrames?: readonly number[];
  dateBoxes?: TemplateDateBox[];
}

/**
 * Two copies of a date, one above/below each strip of a 1200px-wide double
 * strip (strip centres x=300 and x=900).
 */
const twoStripDates = (cy: number): TemplateDateBox[] => [
  { cx: 300, cy, maxWidth: 440, fontSize: 46 },
  { cx: 900, cy, maxWidth: 440, fontSize: 46 },
];

const SPECS: readonly TemplateSpec[] = [
  {
    id: "halloween-a",
    label: "Two 3-Strips",
    tagline: "Two 3-photo strips",
    file: "1200x1800-A.png",
    size: [1200, 1800],
    printSize: "4x6",
    slotFrames: [0, 0, 1, 1, 2, 2],
    slots: [
      [63, 43, 473, 444], [664, 44, 472, 442],
      [63, 518, 473, 444], [664, 519, 472, 442],
      [63, 993, 473, 444], [664, 994, 472, 442],
    ],
  },
  {
    id: "halloween-b",
    label: "Two 3-Strips + Date",
    tagline: "Two 3-photo strips, date on top",
    file: "1200x1800-B.png",
    size: [1200, 1800],
    printSize: "4x6",
    slotFrames: [0, 0, 1, 1, 2, 2],
    slots: [
      [64, 104, 472, 432], [664, 104, 472, 432],
      [64, 564, 472, 432], [664, 564, 472, 432],
      [64, 1024, 472, 432], [664, 1024, 472, 432],
    ],
    // Clear band y 0-100 above the slots (the divider line only crosses x=600).
    dateBoxes: twoStripDates(66),
  },
  {
    id: "halloween-c",
    label: "Two 4-Strips",
    tagline: "Two 4-photo strips",
    file: "1200x1800-C.png",
    size: [1200, 1800],
    printSize: "4x6",
    slotFrames: [0, 0, 1, 1, 2, 2, 3, 3],
    slots: [
      [65, 44, 470, 332], [664, 44, 472, 332],
      [65, 404, 470, 332], [664, 404, 472, 332],
      [65, 764, 470, 332], [664, 764, 472, 332],
      [65, 1124, 470, 332], [664, 1124, 472, 332],
    ],
  },
  {
    id: "halloween-d",
    label: "Two 4-Strips + Title",
    tagline: "Two 4-photo strips, title on top",
    file: "1200x1800-D.png",
    size: [1200, 1800],
    printSize: "4x6",
    slotFrames: [0, 0, 1, 1, 2, 2, 3, 3],
    slots: [
      [65, 154, 470, 322], [664, 154, 472, 322],
      [65, 504, 470, 322], [664, 504, 472, 322],
      [65, 854, 470, 322], [664, 854, 472, 322],
      [65, 1204, 470, 322], [664, 1204, 472, 322],
    ],
    // The top band holds the baked-in title, so the date sits in the clear band under the last slot (y 1526 to the pumpkins at ~1668).
    dateBoxes: twoStripDates(1612),
  },
  {
    id: "halloween-e",
    label: "Two Big Photos",
    tagline: "Two large photos",
    file: "1200x1800-E.png",
    size: [1200, 1800],
    printSize: "4x6",
    slots: [
      [64, 64, 1072, 692],
      [64, 794, 1072, 692],
    ],
  },
  {
    id: "halloween-f",
    label: "Big + Three",
    tagline: "1 large + 3 small photos",
    file: "1800x1200-F.png",
    size: [1800, 1200],
    printSize: "6x4",
    slots: [
      [53, 52, 1094, 696],
      [53, 782, 540, 376], [630, 782, 540, 376], [1207, 783, 540, 374],
    ],
  },
  {
    id: "halloween-g",
    label: "Four Grid",
    tagline: "Four-photo grid",
    file: "1800x1200-G.png",
    size: [1800, 1200],
    printSize: "6x4",
    slots: [
      [53, 43, 824, 434], [923, 43, 824, 434],
      [53, 513, 824, 434], [923, 513, 824, 434],
    ],
  },
  {
    id: "halloween-h",
    label: "Three + Text",
    tagline: "Three photos + title",
    file: "1800x1200-H.png",
    size: [1800, 1200],
    printSize: "6x4",
    slots: [
      [52, 42, 826, 516], [922, 42, 826, 516],
      [52, 602, 826, 516],
    ],
  },
  {
    id: "halloween-j",
    label: "Two + Text",
    tagline: "Two photos + title",
    file: "1800x1200-J.png",
    size: [1800, 1200],
    printSize: "6x4",
    slots: [
      [53, 43, 1044, 534],
      [53, 623, 1044, 534],
    ],
  },
  {
    id: "halloween-k",
    label: "Two + Title & Date",
    tagline: "Two photos, title on top, date below",
    file: "1800x1200-K.png",
    size: [1800, 1200],
    printSize: "6x4",
    slots: [
      [53, 193, 824, 794],
      [923, 193, 824, 794],
    ],
    // Clear band y 990-1200 between the two pumpkin groups.
    dateBoxes: [{ cx: 900, cy: 1098, maxWidth: 700, fontSize: 60 }],
  },
  {
    id: "halloween-l",
    label: "Two Wide Pairs",
    tagline: "Two horizontal 2-photo strips",
    file: "1800x1200-L.png",
    size: [1800, 1200],
    printSize: "6x4",
    slotFrames: [0, 1, 0, 1],
    slots: [
      [53, 43, 824, 434], [923, 43, 824, 434],
      [53, 613, 824, 434], [923, 613, 824, 434],
    ],
  },
  {
    id: "halloween-m",
    label: "Full Photo",
    tagline: "One full photo",
    file: "1800x1200-M.png",
    size: [1800, 1200],
    printSize: "6x4",
    slots: [[53, 43, 1694, 924]],
  },
  {
    id: "halloween-2x6",
    label: "Photo Strip 2x6",
    tagline: "4-photo strip, title on top",
    file: "600x1800.png",
    size: [600, 1800],
    printSize: "2x6",
    slots: [
      [64, 214, 472, 322],
      [64, 564, 472, 322],
      [64, 914, 472, 322],
      [64, 1264, 472, 322],
    ],
  },
];

function toBox([left, top, width, height]: Slot): Box {
  return { left, top, width, height };
}

export const HALLOWEEN_LAYOUTS: LayoutDef[] = SPECS.map((spec) => {
  const [canvasW, canvasH] = spec.size;
  const boxes = spec.slots.map(toBox);
  return {
    id: spec.id,
    label: spec.label,
    tagline: spec.tagline,
    photoCount: spec.slotFrames ? Math.max(...spec.slotFrames) + 1 : boxes.length,
    computeLayout: () => ({ canvasW, canvasH, boxes }),
    template: {
      themeId: "halloween",
      image: `${BASE}/${spec.file}`,
      printSize: spec.printSize,
      slotFrames: spec.slotFrames ?? boxes.map((_, i) => i),
      dateBoxes: spec.dateBoxes ?? [],
    },
  };
});
