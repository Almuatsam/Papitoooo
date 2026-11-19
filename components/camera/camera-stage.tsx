"use client";

import type { ReactNode, RefObject } from "react";
import { Loader2 } from "lucide-react";
import type { CameraStatus } from "@/hooks/use-camera";
import { useLanguage } from "@/hooks/use-language";
import { ThemeChrome } from "@/components/theme/theme-decor";
import { ColorOverlayLayer } from "@/components/camera/color-overlay-layer";
import { FilteredVideoCanvas } from "@/components/camera/filtered-canvas";
import { cn } from "@/lib/cn";
import type { FilterDef } from "@/lib/filters";
import type { PreviewMode } from "@/lib/preview-mode";

interface CameraStageProps {
  videoRef: RefObject<HTMLVideoElement>;
  status: CameraStatus;
  filter: FilterDef;
  /** "css": filter the <video> directly. "canvas": draw it through the export pipeline. */
  previewMode: PreviewMode;
  /** Mirror the preview. Front camera only. */
  mirrored: boolean;
  children?: ReactNode;
}

/**
 * The camera preview box. 4:3, object-cover: the framing here is what the
 * captured photo and the strip will show. Mirrored only for the front camera.
 */
export function CameraStage({ videoRef, status, filter, previewMode, mirrored, children }: CameraStageProps) {
  const { t } = useLanguage();
  const isNatural = filter.css === "none" && !filter.overlay && !filter.glow;
  const useCanvas = previewMode === "canvas" && !isNatural;

  return (
    <div
      data-testid="camera-stage"
      data-preview-mode={useCanvas ? "canvas" : "css"}
      className="facet neon-edge relative aspect-[4/3] w-full overflow-hidden border-3 border-line bg-black"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        data-testid="camera-video"
        className={cn("h-full w-full object-cover", mirrored && "-scale-x-100")}
        style={{ filter: useCanvas || filter.css === "none" ? undefined : filter.css }}
      />
      {useCanvas ? (
        <FilteredVideoCanvas videoRef={videoRef} filter={filter} mirrored={mirrored} />
      ) : (
        <ColorOverlayLayer overlay={filter.overlay} />
      )}

      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-ink">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">
            {status === "starting" ? t.camera.wakingCamera : t.camera.cameraOff}
          </span>
        </div>
      )}

      <ThemeChrome slot="camera" />
      {children}
    </div>
  );
}
