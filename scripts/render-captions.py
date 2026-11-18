"""
Renders strips through the app's /dev-preview page in a real browser and reports
where the caption was drawn.

For each job the strip is rendered twice, with the caption and with an empty
caption. The pixels that differ are the caption's. Prints JSON: for every job its
bounding box, the most common colour among the differing pixels, and the canvas
size.

Usage: python scripts/render-captions.py BASE_URL JOBS_JSON
  JOBS_JSON: [{"theme": "squ", "layout": "strip-4", "caption": "First try"}, ...]
Optional env SAVE_DIR: also writes each captioned render there as a PNG.
"""
import base64
import io
import json
import os
import sys
from collections import Counter
from urllib.parse import urlencode

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

base_url, jobs = sys.argv[1], json.loads(sys.argv[2])
save_dir = os.environ.get("SAVE_DIR")


def render(page, theme, layout, caption):
    query = urlencode({"theme": theme, "layout": layout, "caption": caption, "seed": "0.42"})
    page.goto(f"{base_url}/dev-preview?{query}")
    page.wait_for_selector("img[alt=preview]", timeout=120_000)
    src = page.eval_on_selector("img[alt=preview]", "e => e.src")
    return Image.open(io.BytesIO(base64.b64decode(src.split(",", 1)[1]))).convert("RGBA")


results = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_default_navigation_timeout(240_000)
    for job in jobs:
        with_caption = render(page, job["theme"], job["layout"], job["caption"])
        without = render(page, job["theme"], job["layout"], "")
        if save_dir:
            os.makedirs(save_dir, exist_ok=True)
            with_caption.save(os.path.join(save_dir, f'{job["theme"]}-{job["layout"]}.png'))
        a, b = np.array(with_caption), np.array(without)
        diff = (a != b).any(axis=2)
        ys, xs = np.where(diff)
        entry = {**job, "size": list(with_caption.size), "pixels": int(diff.sum())}
        if diff.any():
            colours = Counter(map(tuple, a[diff][:, :3].tolist()))
            top = colours.most_common(1)[0][0]
            entry.update(
                {
                    "bbox": [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1],
                    "topColour": "#%02X%02X%02X" % top,
                    "topColourShare": round(colours[top] / int(diff.sum()), 3),
                }
            )
        results.append(entry)
    browser.close()
print(json.dumps(results))
