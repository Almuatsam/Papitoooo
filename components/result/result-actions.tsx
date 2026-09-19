"use client";

import { useState } from "react";
import { Download, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { saveImage } from "@/lib/download";

interface ResultActionsProps {
  renderFullRes: () => Promise<string>;
  onRetake: () => void;
  onStartOver: () => void;
  disabled: boolean;
}

export function ResultActions({ renderFullRes, onRetake, onStartOver, disabled }: ResultActionsProps) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const url = await renderFullRes();
      await saveImage(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" onClick={handleDownload} disabled={disabled || busy}>
        <Download className="h-5 w-5" />
        {busy ? t.result.preparing : t.result.download}
      </Button>
      <div className="flex gap-3">
        <Button variant="outline" size="md" className="flex-1" onClick={onRetake}>
          <RefreshCw className="h-4 w-4" />
          {t.result.retake}
        </Button>
        <Button variant="ghost" size="md" className="flex-1" onClick={onStartOver}>
          <RotateCcw className="h-4 w-4" />
          {t.result.startOver}
        </Button>
      </div>
    </div>
  );
}
