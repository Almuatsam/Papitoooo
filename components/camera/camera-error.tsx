"use client";

import { CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import type { CameraError } from "@/lib/camera-utils";

export function CameraErrorPanel({
  error,
  onRetry,
}: {
  error: CameraError;
  onRetry: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 rounded-xl border-3 border-ink bg-panel p-8 text-center">
      <CameraOff className="h-12 w-12" />
      <div className="space-y-2">
        <h2 className="text-2xl">{t.cameraError.title}</h2>
        <p className="max-w-xs text-sm font-medium text-muted">{t.cameraError[error.kind]}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        {t.cameraError.retry}
      </Button>
    </div>
  );
}
