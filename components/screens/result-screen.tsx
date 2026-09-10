"use client";

import { useEffect } from "react";
import { useSession } from "@/hooks/use-session-store";
import { useStripRender } from "@/hooks/use-strip-render";
import { StripPreview } from "@/components/result/strip-preview";
import { Customizer } from "@/components/result/customizer";
import { ResultActions } from "@/components/result/result-actions";
import { PHOTO_COUNT } from "@/lib/constants";

export function ResultScreen() {
  const { frames, settings, updateSettings, retake, reset, goHome } = useSession();
  const { previewUrl, rendering, error, renderFullRes } = useStripRender(frames, settings);

  useEffect(() => {
    if (frames.length < PHOTO_COUNT) goHome();
  }, [frames.length, goHome]);

  if (frames.length < PHOTO_COUNT) return null;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <header className="mb-6 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl">Your strip</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">
          Tweak it, then download
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex justify-center lg:sticky lg:top-6 lg:w-[340px] lg:shrink-0">
          <StripPreview url={previewUrl} rendering={rendering} error={error} />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <Customizer settings={settings} onChange={updateSettings} />
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
