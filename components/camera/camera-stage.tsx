"use client";

import type { ReactNode, RefObject } from "react";
import { Loader2 } from "lucide-react";
import type { CameraStatus } from "@/hooks/use-camera";

interface CameraStageProps {
  videoRef: RefObject<HTMLVideoElement>;
  status: CameraStatus;
  /** CSS filter string applied live to the preview. */
  filterCss: string;
  children?: ReactNode;
}

/**
 * The camera preview box. 4:3, mirrored, object-cover — the framing here is what
 * the captured photo and the strip will show.
 */
export function CameraStage({ videoRef, status, filterCss, children }: CameraStageProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border-3 border-ink bg-ink">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="h-full w-full -scale-x-100 object-cover"
        style={{ filter: filterCss === "none" ? undefined : filterCss }}
      />

      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink text-paper">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">
            {status === "starting" ? "Waking the camera" : "Camera off"}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}
