"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Camera, FlipHorizontal, Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraStage } from "@/components/camera/camera-stage";
import { CameraErrorPanel } from "@/components/camera/camera-error";
import { CountdownOverlay } from "@/components/camera/countdown-overlay";
import { ScreenFlash } from "@/components/camera/flash-overlay";
import { SessionHud } from "@/components/camera/session-hud";
import { FilterCarousel } from "@/components/camera/filter-carousel";
import { FilteredImageCanvas } from "@/components/camera/filtered-canvas";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useCamera } from "@/hooks/use-camera";
import { usePhotoSession, type FlashMode } from "@/hooks/use-photo-session";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { ColorOverlayLayer } from "@/components/camera/color-overlay-layer";
import { GlowLayer } from "@/components/camera/glow-layer";
import { getFilter } from "@/lib/filters";
import { getLayout } from "@/lib/layouts";
import { detectPreviewMode, type PreviewMode } from "@/lib/preview-mode";
import { cn } from "@/lib/cn";

const FLASH_STORAGE_KEY = "photobooth.flashMode";

function readStoredFlashMode(): FlashMode {
  try {
    return window.localStorage.getItem(FLASH_STORAGE_KEY) === "off" ? "off" : "auto";
  } catch {
    return "auto";
  }
}

export function CameraScreen() {
  const { settings, updateSettings, finishSession, goHome } = useSession();
  const { t } = useLanguage();
  const { videoRef, status, error, facing, canSwitch, torch, start, switchCamera } = useCamera();
  const shotCount = getLayout(settings.layoutId).photoCount;
  const [flashMode, setFlashModeState] = useState<FlashMode>("auto");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("css");
  const session = usePhotoSession({
    videoRef,
    shotCount,
    onComplete: finishSession,
    flashMode,
    facing,
    torch,
  });
  useWakeLock(session.isRunning);

  useEffect(() => {
    void start();
  }, [start]);

  // Browser-only probes run after mount so the first render matches the server.
  useEffect(() => {
    setFlashModeState(readStoredFlashMode());
    setPreviewMode(detectPreviewMode());
  }, []);

  const setFlashMode = (mode: FlashMode) => {
    setFlashModeState(mode);
    try {
      window.localStorage.setItem(FLASH_STORAGE_KEY, mode);
    } catch {
      // Not persisted; the setting still applies for this visit.
    }
  };

  const filter = getFilter(settings.filterId);
  const css = filter.css;
  const ready = status === "ready";
  const mirrored = facing === "user";
  const reviewOnCanvas = previewMode === "canvas";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            session.cancel();
            goHome();
          }}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t.camera.back}
        </Button>
        <div className="flex items-center gap-2">
          <ThemeSwitcher disabled={session.isRunning} />
          <span className="hidden text-sm font-bold uppercase tracking-widest text-muted sm:inline">
            {t.layouts[settings.layoutId].label}
          </span>
        </div>
      </div>

      {error ? (
        <CameraErrorPanel
          error={error}
          onRetry={() => void start()}
          shotCount={shotCount}
          onFallbackComplete={finishSession}
        />
      ) : (
        <CameraStage
          videoRef={videoRef}
          status={status}
          filter={filter}
          previewMode={previewMode}
          mirrored={mirrored}
        >
          <SessionHud
            filterLabel={t.filters[settings.filterId]}
            captured={session.frames.length}
            shotCount={shotCount}
            running={session.isRunning}
          />

          {session.phase === "countdown" && <CountdownOverlay value={session.count} />}
          {session.phase === "review" && session.lastFrame && (
            <div className="absolute inset-0 z-30">
              {reviewOnCanvas ? (
                <FilteredImageCanvas src={session.lastFrame} filter={filter} />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- captured-frame data URL, shown for a beat */}
                  <img
                    src={session.lastFrame}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: css === "none" ? undefined : css }}
                  />
                  <ColorOverlayLayer overlay={filter.overlay} />
                  <GlowLayer src={session.lastFrame} glow={filter.glow} />
                </>
              )}
            </div>
          )}
        </CameraStage>
      )}

      {session.flashStage && <ScreenFlash stage={session.flashStage} />}

      {!error && (
        <div className="flex items-center justify-between gap-2" data-testid="camera-controls">
          <div role="radiogroup" aria-label={t.camera.flash} className="flex items-center gap-1">
            {(["auto", "off"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={flashMode === mode}
                data-testid={`flash-${mode}`}
                disabled={session.isRunning}
                onClick={() => setFlashMode(mode)}
                className={cn(
                  "facet-sm inline-flex min-h-11 items-center gap-1.5 border-2 border-line px-3 text-sm font-bold uppercase tracking-wide disabled:opacity-40",
                  flashMode === mode ? "bg-accent text-paper" : "bg-panel text-ink",
                )}
              >
                {mode === "auto" ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                {t.camera.flash} {mode === "auto" ? t.camera.flashAuto : t.camera.flashOff}
              </button>
            ))}
          </div>
          {canSwitch && (
            <Button
              variant="outline"
              size="sm"
              data-testid="switch-camera"
              disabled={session.isRunning}
              onClick={switchCamera}
              aria-label={t.camera.switchCamera}
            >
              <FlipHorizontal className="h-4 w-4" />
              {t.camera.switchCamera}
            </Button>
          )}
        </div>
      )}

      <FilterCarousel
        value={settings.filterId}
        onChange={(filterId) => updateSettings({ filterId })}
        disabled={session.isRunning}
      />

      <div className="mt-auto flex justify-center pb-2">
        {session.isRunning ? (
          <Button variant="outline" size="lg" onClick={session.cancel}>
            {t.camera.stop}
          </Button>
        ) : (
          <Button
            size="lg"
            className="min-w-[16rem]"
            disabled={!ready || Boolean(error)}
            data-testid="start-session"
            onClick={session.start}
          >
            <Camera className="h-6 w-6" />
            {ready ? t.camera.startSession : t.camera.waiting}
          </Button>
        )}
      </div>
    </div>
  );
}
