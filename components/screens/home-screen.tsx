"use client";

import { Camera, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session-store";
import { PHOTO_COUNT } from "@/lib/constants";

export function HomeScreen() {
  const { goCamera } = useSession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex items-end gap-2" aria-hidden>
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <span
            key={i}
            className="block h-10 w-8 border-3 border-ink bg-paper sm:h-12 sm:w-10"
            style={{ transform: `rotate(${(i - 1.5) * 3}deg)` }}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h1 className="text-6xl leading-[0.9] sm:text-8xl">
          PHOTO
          <br />
          <span className="text-accent">BOOTH</span>
        </h1>
        <p className="mx-auto max-w-sm text-lg font-medium text-muted">
          Four shots. One film strip. Straight to your camera roll.
        </p>
      </div>

      <Button size="lg" onClick={goCamera} className="min-w-[16rem]">
        <Camera className="h-6 w-6" />
        Start
      </Button>

      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <Lock className="h-4 w-4" />
        Your photos never leave this device
      </p>
    </div>
  );
}
