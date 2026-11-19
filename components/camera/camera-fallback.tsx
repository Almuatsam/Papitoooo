"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { photoFileToFrame } from "@/lib/photo-file";
import type { Frame } from "@/types";

interface CameraFallbackProps {
  shotCount: number;
  onComplete: (frames: Frame[]) => void;
}

/**
 * When the browser gives no camera access (some in-app browsers, insecure
 * context), let the phone own camera app take each photo through a file
 * input. The photos then go through the same filters and frames.
 */
export function CameraFallback({ shotCount, onComplete }: CameraFallbackProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setFailed(false);
    try {
      const frame = await photoFileToFrame(file);
      const next = [...frames, frame];
      setFrames(next);
      if (next.length >= shotCount) onComplete(next);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center" data-testid="camera-fallback">
      <h3 className="text-lg">{t.cameraFallback.title}</h3>
      <p className="max-w-xs text-sm font-medium text-muted">{t.cameraFallback.body}</p>
      <input
        ref={inputRef}
        data-testid="fallback-input"
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <Button size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {t.cameraFallback.take} {Math.min(frames.length + 1, shotCount)} {t.cameraFallback.of} {shotCount}
      </Button>
      {busy && <p className="text-xs font-bold uppercase text-muted">{t.cameraFallback.working}</p>}
      {failed && (
        <p role="alert" className="text-xs font-bold text-muted">
          {t.cameraFallback.failed}
        </p>
      )}
    </div>
  );
}
