"use client";

import { Camera, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ThemeChrome } from "@/components/theme/theme-decor";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";
import { PHOTO_COUNT } from "@/lib/constants";

export function HomeScreen() {
  const { goCamera } = useSession();
  const { t } = useLanguage();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden px-6 py-16 text-center">
      <ThemeChrome slot="home" />

      <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-between px-4">
        <ThemeSwitcher />
        <LanguageSwitch />
      </div>

      <div className="flex items-end gap-2" aria-hidden>
        {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
          <span
            key={i}
            className="block h-10 w-8 rounded-sm border-3 border-ink bg-panel sm:h-12 sm:w-10"
            style={{ transform: `rotate(${(i - 1.5) * 3}deg)` }}
          />
        ))}
      </div>

      <div className="space-y-4">
        <h1 className="text-6xl leading-[0.9] sm:text-8xl">
          {t.app.name.split(" ")[0] ?? t.app.name}
          <br />
          <span className="text-accent">{t.app.name.split(" ").slice(1).join(" ") || t.app.name}</span>
        </h1>
        <p className="mx-auto max-w-sm text-lg font-medium text-muted">{t.app.tagline}</p>
      </div>

      <Button size="lg" onClick={goCamera} className="min-w-[16rem]">
        <Camera className="h-6 w-6" />
        {t.home.start}
      </Button>

      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <Lock className="h-4 w-4" />
        {t.app.privacy}
      </p>
    </div>
  );
}
