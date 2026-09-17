"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";
import { useStripRender } from "@/hooks/use-strip-render";
import { StripPreview } from "@/components/result/strip-preview";
import { Customizer } from "@/components/result/customizer";
import { ResultActions } from "@/components/result/result-actions";
import { ThemeChrome } from "@/components/theme/theme-decor";
import type { StickerCanvasHandle } from "@/components/result/sticker-canvas";
import { getLayout } from "@/lib/layouts";

export function ResultScreen() {
  const { frames, settings, updateSettings, retake, reset, goHome } = useSession();
  const { t, lang } = useLanguage();
  const { previewUrl, rendering, error, renderFullRes } = useStripRender(frames, settings, lang);
  const canvasRef = useRef<StickerCanvasHandle>(null);
  const shotCount = getLayout(settings.layoutId).photoCount;

  useEffect(() => {
    if (frames.length < shotCount) goHome();
  }, [frames.length, shotCount, goHome]);

  if (frames.length < shotCount) return null;

  return (
    <div className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <ThemeChrome slot="panel" />

      <header className="mb-6 text-center lg:text-start">
        <h1 className="text-4xl sm:text-5xl">{t.result.heading}</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">{t.result.subheading}</p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex justify-center lg:sticky lg:top-6 lg:w-[340px] lg:shrink-0">
          <StripPreview
            themeId={settings.themeId}
            layoutId={settings.layoutId}
            url={previewUrl}
            rendering={rendering}
            error={error}
            stickers={settings.stickers}
            onStickersChange={(stickers) => updateSettings({ stickers })}
            canvasRef={canvasRef}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <Customizer
            settings={settings}
            onChange={updateSettings}
            onAddStickerSvg={(svg) => canvasRef.current?.addSticker("svg", svg)}
            onAddEmoji={(emoji) => canvasRef.current?.addSticker("emoji", emoji)}
          />
          <ResultActions
            renderFullRes={renderFullRes}
            onRetake={retake}
            onStartOver={reset}
            disabled={!previewUrl || error}
          />
        </div>
      </div>
    </div>
  );
}
