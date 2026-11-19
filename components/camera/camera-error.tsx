"use client";

import { CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraFallback } from "@/components/camera/camera-fallback";
import { useLanguage } from "@/hooks/use-language";
import type { CameraError } from "@/lib/camera-utils";
import type { Frame } from "@/types";

/** Error kinds where an in-app browser is a likely cause, so "open in your browser" is worth saying. */
const OPEN_IN_BROWSER_KINDS: ReadonlyArray<CameraError["kind"]> = ["unsupported", "insecure", "permission", "unknown"];

export function CameraErrorPanel({
  error,
  onRetry,
  shotCount,
  onFallbackComplete,
}: {
  error: CameraError;
  onRetry: () => void;
  shotCount: number;
  onFallbackComplete: (frames: Frame[]) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="facet flex flex-col items-center justify-center gap-4 border-3 border-line bg-panel p-6 text-center">
      <CameraOff className="h-10 w-10" />
      <div className="space-y-2">
        <h2 className="text-2xl">{t.cameraError.title}</h2>
        <p className="max-w-xs text-sm font-medium text-muted">{t.cameraError[error.kind]}</p>
        {OPEN_IN_BROWSER_KINDS.includes(error.kind) && (
          <p data-testid="open-in-browser" className="max-w-xs text-sm font-bold">
            {t.cameraError.openInBrowser}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        {t.cameraError.retry}
      </Button>
      <CameraFallback shotCount={shotCount} onComplete={onFallbackComplete} />
    </div>
  );
}
