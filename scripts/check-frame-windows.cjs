/**
 * Compares the photo boxes the app draws for a theme's overlay frame with the
 * transparent windows in each frame PNG.
 *
 * Usage: node scripts/check-frame-windows.cjs [themeId] [pngDir]
 * Needs: python3 with Pillow + numpy (used to read the PNG alpha channel).
 * Exit code is 1 if any layout is off by more than 1px.
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");
const { execFileSync } = require("child_process");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const themeId = process.argv[2] || "muscat-college";

// Minimal TS loader with the "@/" alias.
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(root, request.slice(2));
  return origResolve.call(this, request, ...rest);
};
require.extensions[".ts"] = require.extensions[".tsx"] = (mod, filename) => {
  const out = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  mod._compile(out.outputText, filename);
};

const { LAYOUTS } = require(path.join(root, "lib/layouts/index.ts"));
const { getTheme } = require(path.join(root, "lib/themes/index.ts"));
const theme = getTheme(themeId);
const dir = path.join(root, "public", theme.strip.overlayFrame.dir);

// Python helper: for each box, find where each of the window's four edges
// really is in the PNG's alpha channel. Frames can have decorations (flowers,
// stickers) overlapping a window, so an edge is located by the biggest
// jump in transparency across it, scanning from 4px outside the box inward. Also reports how much of the box the
// decorations cover.
const py = `
import sys, json, numpy as np
from PIL import Image
png, boxes = sys.argv[1], json.loads(sys.argv[2])
a = np.array(Image.open(png).convert("RGBA"))[:, :, 3]
H, W = a.shape
t = a == 0
def frac(line): return float(line.mean()) if line.size else 0.0
def edge(lines):
    # lines run from 4px outside the box inward; the window edge is where the
    # transparent fraction jumps the most (decor may hide part of a line, but
    # the jump still shows).
    fr = [(d, frac(line)) for d, line in lines]
    best = max(range(1, len(fr)), key=lambda i: fr[i][1] - fr[i - 1][1])
    return fr[best][0] if fr[best][1] - fr[best - 1][1] >= 0.05 else None
res = {"w": W, "h": H, "boxes": []}
M = 8  # skip the corners, where rounded art or decor often sits
for b in boxes:
    l, tp, w, h = b["left"], b["top"], b["width"], b["height"]
    r, bt = l + w, tp + h
    xs = slice(l + M, r - M); ys = slice(tp + M, bt - M)
    L = edge([(d, t[ys, l + d]) for d in range(-4, 5) if 0 <= l + d < W])          # first transparent column
    R = edge([(d, t[ys, r - 1 - d]) for d in range(-4, 5) if 0 <= r - 1 - d < W])  # last transparent column
    T = edge([(d, t[tp + d, xs]) for d in range(-4, 5) if 0 <= tp + d < H])
    B = edge([(d, t[bt - 1 - d, xs]) for d in range(-4, 5) if 0 <= bt - 1 - d < H])
    inside = t[tp:bt, l:r]
    res["boxes"].append({"edges": [L, T, R, B], "covered": round(float((~inside).mean()) * 100, 1)})
print(json.dumps(res))
`;

let bad = 0;
for (const layout of LAYOUTS) {
  const { canvasW, canvasH, boxes } = layout.computeLayout(theme);
  const png = path.join(dir, `${layout.id}.png`);
  const r = JSON.parse(execFileSync("python", ["-c", py, png, JSON.stringify(boxes)], { encoding: "utf8" }));
  const issues = [];
  const notes = [];
  if (r.w !== canvasW || r.h !== canvasH) issues.push(`canvas ${canvasW}x${canvasH} vs PNG ${r.w}x${r.h}`);
  boxes.forEach((b, i) => {
    const o = r.boxes[i];
    // edges are offsets (px) from the app's box edge to the PNG's window edge, positive = window is smaller.
    const names = ["left", "top", "right", "bottom"];
    o.edges.forEach((d, k) => {
      if (d === null || Math.abs(d) > 1) issues.push(`box ${i} ${names[k]} edge off by ${d === null ? "(no window edge found within 4px)" : d + "px"}  app=[${b.left},${b.top},${b.width},${b.height}]`);
    });
    if (o.covered > 0) notes.push(`box ${i}: ${o.covered}% of the window is covered by frame decoration`);
  });
  if (issues.length) bad++;
  console.log(`${issues.length ? "FAIL" : "ok  "} ${layout.id} (${canvasW}x${canvasH}, ${boxes.length} boxes)`);
  issues.forEach((s) => console.log("     " + s));
  if (process.env.VERBOSE) notes.forEach((s) => console.log("     note: " + s));
}
console.log(bad ? `\n${bad} layout(s) off by more than 1px` : "\nAll layouts match within 1px");
process.exit(bad ? 1 : 0);
