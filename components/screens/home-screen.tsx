"use client";

import { Lock } from "lucide-react";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LayoutSwitcher } from "@/components/home/layout-switcher";
import { BoothShell } from "@/components/home/booth/booth-shell";
import { BoothSign } from "@/components/home/booth/booth-sign";
import { BoothCabinet } from "@/components/home/booth/booth-cabinet";
import { BoothCurtain } from "@/components/home/booth/booth-curtain";
import { BoothStool } from "@/components/home/booth/booth-stool";
import { BoothCoinSlot } from "@/components/home/booth/booth-coin-slot";
import { BoothMirror } from "@/components/home/booth/booth-mirror";
import { Wordmark } from "@/components/home/booth/wordmark";
import { StripPreview } from "@/components/home/booth/strip-preview";
import { GlitterOverlay } from "@/components/home/booth/glitter-overlay";
import { StartButton } from "@/components/home/booth/start-button";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";

export function HomeScreen() {
  const { goCamera } = useSession();
  const { t } = useLanguage();

  return (
    <BoothShell
      topBar={
        <div className="flex items-center justify-between opacity-80">
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LayoutSwitcher />
          </div>
          <LanguageSwitch />
        </div>
      }
      sign={
        <BoothSign>
          <Wordmark />
        </BoothSign>
      }
    >
      <GlitterOverlay />

      <p className="mx-auto max-w-xs text-sm font-medium text-[color:var(--booth-chrome-1)]">{t.app.tagline}</p>

      <BoothCabinet
        display={
          <>
            <StripPreview />
            <BoothCoinSlot />
          </>
        }
        entrance={
          <>
            <BoothCurtain />
            <StartButton onStart={goCamera} />
            <BoothStool />
          </>
        }
        mirror={<BoothMirror />}
      />

      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--booth-chrome-2)]">
        <Lock className="h-3.5 w-3.5" />
        {t.app.privacy}
      </p>
    </BoothShell>
  );
}
