"use client";

/**
 * TEMPORARY dev-only tool for the visual-design-iteration skill's
 * render-and-inspect loop. Bypasses the camera flow (which a headless
 * browser can't grant permission for) by feeding renderStrip() plain
 * placeholder "photos" so a theme+layout combo can be screenshotted and
 * inspected directly. Not linked from any real navigation. Delete before
 * calling this pass done.
 *
 * Usage: /dev-preview?theme=receipt&layout=strip-4&caption=friday%20night
 */

import { useEffect, useState } from "react";
import { renderStrip } from "@/lib/strip-renderer";
import { PHOTO_HEIGHT, PHOTO_WIDTH } from "@/lib/constants";
import { getLayout } from "@/lib/layouts";
import type { Lang, LayoutId, StripThemeId } from "@/types";

function placeholderFrame(seed: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_WIDTH;
  canvas.height = PHOTO_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const hue = (seed * 61) % 360;
  ctx.fillStyle = `hsl(${hue}, 35%, 62%)`;
  ctx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.arc(PHOTO_WIDTH / 2, PHOTO_HEIGHT * 0.4, PHOTO_HEIGHT * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(PHOTO_WIDTH / 2, PHOTO_HEIGHT * 1.05, PHOTO_WIDTH * 0.26, PHOTO_HEIGHT * 0.32, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function DevPreviewPage() {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const themeId = (sp.get("theme") ?? "receipt") as StripThemeId;
    const layoutId = (sp.get("layout") ?? "strip-4") as LayoutId;
    const caption = sp.get("caption") ?? "friday night";
    const subtitle = sp.get("subtitle") ?? "";
    const accentColor = sp.get("accent") ?? "";
    const seed = Number(sp.get("seed") ?? "0.42");
    const lang = (sp.get("lang") ?? "en") as Lang;
    setLabel(`${themeId} / ${layoutId}`);

    const count = getLayout(layoutId).photoCount;
    const frames = Array.from({ length: count }, (_, i) => placeholderFrame(i));

    renderStrip({
      frames,
      filterId: "natural",
      themeId,
      layoutId,
      borderColor: "",
      bgColor: "",
      accentColor,
      caption,
      subtitle,
      showDate: true,
      stickers: [],
      lang,
      scale: 1,
      decorSeed: seed,
    })
      .then(setUrl)
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error("[dev-preview] renderStrip failed", err);
      });
  }, []);

  return (
    <div style={{ background: "#9a9a9a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#222" }}>{label}</div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="preview" />
      ) : (
        <p>Rendering…</p>
      )}
    </div>
  );
}
