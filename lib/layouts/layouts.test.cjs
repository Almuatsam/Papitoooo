const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { execFileSync } = require("child_process");
const { root } = require("../../scripts/ts-register.cjs");

const { LAYOUTS } = require(path.join(root, "lib/layouts/index.ts"));
const { getTheme } = require(path.join(root, "lib/themes/index.ts"));
const { resolvePads } = require(path.join(root, "lib/layouts/pads.ts"));

/** Canvas size every SQU frame PNG must have. */
const SQU_SIZES = {
  "strip-4": [900, 2700],
  "double-strip-4": [900, 2700],
  "strip-3": [900, 2700],
  "grid-6": [900, 1524],
  "single-portrait": [810, 1593],
  "single-landscape": [1080, 1343],
  "triple-horizontal": [990, 1808],
  "asymmetric-3": [900, 1775],
  "asymmetric-4": [894, 1619],
};

/** Share of a box that may be covered by decoration placed over a window on purpose. */
const MAX_COVERED_SHARE = 0.2;
/** Transparent pixels outside every photo box mean a window left without a photo. */
const MAX_UNUSED_TRANSPARENT_PIXELS = 200;

const ALPHA_SCRIPT = `
import sys, json
import numpy as np
from PIL import Image
a = np.array(Image.open(sys.argv[1]).convert("RGBA"))[:, :, 3]
boxes = json.loads(sys.argv[2])
clear = a == 0
used = np.zeros_like(clear)
shares = []
for b in boxes:
    l, t, w, h = b["left"], b["top"], b["width"], b["height"]
    shares.append(float(clear[t:t + h, l:l + w].mean()))
    used[max(t - 2, 0):t + h + 2, max(l - 2, 0):l + w + 2] = True
print(json.dumps({"w": a.shape[1], "h": a.shape[0], "shares": shares, "unused": int((clear & ~used).sum())}))
`;

function inspectFrame(themeId, layoutId, boxes) {
  const theme = getTheme(themeId);
  const png = path.join(root, "public", theme.strip.overlayFrame.dir, `${layoutId}.png`);
  return JSON.parse(execFileSync("python", ["-c", ALPHA_SCRIPT, png, JSON.stringify(boxes)], { encoding: "utf8" }));
}

test("SQU: each layout matches its frame PNG", async (t) => {
  const theme = getTheme("squ");
  for (const layout of LAYOUTS) {
    await t.test(layout.id, () => {
      const [w, h] = SQU_SIZES[layout.id];
      const { canvasW, canvasH, boxes } = layout.computeLayout(theme);
      assert.deepEqual([canvasW, canvasH], [w, h], "canvas size");

      const frame = inspectFrame("squ", layout.id, boxes);
      assert.deepEqual([frame.w, frame.h], [canvasW, canvasH], "PNG size");
      assert.equal(boxes.length, layout.photoCount, "one box per photo");
      frame.shares.forEach((share, i) => {
        assert.ok(share >= 1 - MAX_COVERED_SHARE, `box ${i} is only ${(share * 100).toFixed(1)}% transparent`);
      });
      assert.ok(frame.unused <= MAX_UNUSED_TRANSPARENT_PIXELS, `${frame.unused} transparent pixels lie outside every photo box`);
    });
  }
});

test("SQU: strip-3 photos are centred, starting at y = 697", () => {
  const strip3 = LAYOUTS.find((l) => l.id === "strip-3");
  const { boxes } = strip3.computeLayout(getTheme("squ"));
  assert.deepEqual(boxes.map((b) => b.top), [697, 1171, 1645]);
  assert.deepEqual(boxes.map((b) => b.left), [236, 236, 236]);
});

test("a theme without leftPad/rightPad/topPad lays out as it did with outerPad alone", () => {
  const base = getTheme("graduation");
  const { leftPad, rightPad, topPad, ...strip } = base.strip;
  const legacy = { ...base, strip: { ...strip, outerPad: 100, bottomPad: 200, gap: 30, overlayFrame: undefined } };

  assert.deepEqual(resolvePads(legacy.strip), { leftPad: 100, rightPad: 100, topPad: 100 });

  const W = 600;
  const H = 450;
  const expected = {
    "strip-3": { canvasW: W + 200, canvasH: 100 + 3 * H + 60 + 200, first: [100, 100] },
    "strip-4": { canvasW: W + 200, canvasH: 100 + 4 * H + 90 + 200, first: [100, 100] },
    "grid-6": { canvasW: 200 + W, canvasH: 100 + 3 * 213.75 + 60 + 200, first: [100, 100] },
    "single-portrait": { canvasW: 200 + W * 0.85, canvasH: 100 + W * 0.85 * 1.5 + 200, first: [100, 100] },
    "single-landscape": { canvasW: 200 + W * 1.3, canvasH: 100 + W * 1.3 * 0.66 + 200, first: [100, 100] },
    "triple-horizontal": { canvasW: 200 + W * 1.15, canvasH: 100 + 3 * W * 1.15 * 0.45 + 60 + 200, first: [100, 100] },
    "asymmetric-3": { canvasW: W + 200, canvasH: 100 + H * 1.3 + 30 + H * 0.75 + 200, first: [100, 100] },
    "asymmetric-4": { canvasW: 200 + W * 0.55 + 30 + W * 0.4, canvasH: 100 + H * 0.55 * 3 + 60 + 200, first: [100, 100] },
    "double-strip-4": { canvasW: W + 200, canvasH: 100 + 4 * H + 90 + 200, first: [100, 100] },
  };
  for (const layout of LAYOUTS) {
    const { canvasW, canvasH, boxes } = layout.computeLayout(legacy);
    const want = expected[layout.id];
    assert.ok(Math.abs(canvasW - want.canvasW) < 1e-9, `${layout.id} canvas width`);
    assert.ok(Math.abs(canvasH - want.canvasH) < 1e-9, `${layout.id} canvas height`);
    assert.deepEqual([boxes[0].left, boxes[0].top], want.first, `${layout.id} first box`);
  }
});

test("explicit left/right/top pads move boxes and widen the canvas", () => {
  const base = getTheme("graduation");
  const strip = { ...base.strip, outerPad: 50, leftPad: 70, rightPad: 20, topPad: 90, overlayFrame: undefined };
  const strip4 = LAYOUTS.find((l) => l.id === "strip-4");
  const { canvasW, boxes } = strip4.computeLayout({ ...base, strip });
  assert.equal(canvasW, 600 + 70 + 20);
  assert.deepEqual([boxes[0].left, boxes[0].top], [70, 90]);
});
