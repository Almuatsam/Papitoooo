"use client";

import { CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CameraError } from "@/lib/camera-utils";

const HINTS: Record<string, string> = {
  permission:
    "Open your browser's site settings, allow camera access for this page, then retry.",
  "no-device": "Connect a webcam or try on a device with a camera.",
  "in-use": "Close Zoom, Meet, or any other app using the camera, then retry.",
  insecure: "Load this page over https:// or from localhost.",
  unsupported: "Try a recent version of Chrome, Firefox, Safari, or Edge.",
  unknown: "Reload the page and try again.",
};

export function CameraErrorPanel({
  error,
  onRetry,
}: {
  error: CameraError;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 border-3 border-ink bg-paper p-8 text-center">
      <CameraOff className="h-12 w-12" />
      <div className="space-y-2">
        <h2 className="text-2xl">Camera unavailable</h2>
        <p className="max-w-xs text-sm font-medium text-muted">{error.message}</p>
        <p className="max-w-xs text-sm font-medium text-muted">
          {HINTS[error.kind] ?? HINTS.unknown}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
