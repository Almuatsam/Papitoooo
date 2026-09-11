"use client";

import { useEffect } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraStage } from "@/components/camera/camera-stage";
import { CameraErrorPanel } from "@/components/camera/camera-error";
import { CountdownOverlay } from "@/components/camera/countdown-overlay";
import { FlashOverlay } from "@/components/camera/flash-overlay";
import { SessionHud } from "@/components/camera/session-hud";
import { FilterCarousel } from "@/components/camera/filter-carousel";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useCamera } from "@/hooks/use-camera";
import { usePhotoSession } from "@/hooks/use-photo-session";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";
import { filterCss } from "@/lib/filters";

export function CameraScreen() {
  const { settings, updateSettings, finishSession, goHome } = useSession();
  const { t } = useLanguage();
  const { videoRef, status, error, start } = useCamera();
  const session = usePhotoSession({ videoRef, onComplete: finishSession });

  useEffect(() => {
    void start();
  }, [start]);

  const css = filterCss(settings.filterId);
  const ready = status === "ready";

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
            {t.camera.shots}
          </span>
        </div>
      </div>

      {error ? (
        <div className="aspect-[4/3] w-full">
          <CameraErrorPanel error={error} onRetry={() => void start()} />
        </div>
      ) : (
        <CameraStage videoRef={videoRef} status={status} filterCss={css}>
          <SessionHud
            filterLabel={t.filters[settings.filterId]}
            captured={session.frames.length}
            running={session.isRunning}
          />

          {session.phase === "countdown" && <CountdownOverlay value={session.count} />}
          {session.phase === "flash" && <FlashOverlay shotKey={session.shotIndex} />}
          {session.phase === "review" && session.lastFrame && (
            // eslint-disable-next-line @next/next/no-img-element -- captured-frame data URL, shown for a beat
            <img
              src={session.lastFrame}
              alt=""
              className="absolute inset-0 z-30 h-full w-full object-cover"
              style={{ filter: css === "none" ? undefined : css }}
            />
          )}
        </CameraStage>
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
          <Button size="lg" className="min-w-[16rem]" disabled={!ready} onClick={session.start}>
            <Camera className="h-6 w-6" />
            {ready ? t.camera.startSession : t.camera.waiting}
          </Button>
        )}
      </div>
    </div>
  );
}
