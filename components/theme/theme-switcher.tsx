"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { THEMES } from "@/lib/themes";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";

const VIEWPORT_MARGIN = 12;

export function ThemeSwitcher({ disabled = false }: { disabled?: boolean }) {
  const { settings, setTheme } = useSession();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelLeft, setPanelLeft] = useState<number | null>(null);
  const active = THEMES.find((theme) => theme.id === settings.themeId) ?? THEMES[0];

  // The panel can be triggered from a button near either edge of the screen
  // (Home has it start-aligned, Camera/Result have it end-aligned) — always
  // clamp its final position to the viewport instead of assuming which side
  // has room, so it can never render off-screen.
  useLayoutEffect(() => {
    if (!open) {
      setPanelLeft(null);
      return;
    }

    const reposition = () => {
      const wrap = wrapRef.current;
      const panel = panelRef.current;
      if (!wrap || !panel) return;
      const wrapRect = wrap.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const maxLeft = window.innerWidth - VIEWPORT_MARGIN - panelWidth;
      const minLeft = VIEWPORT_MARGIN;
      // Default: align the panel's start edge with the trigger's start edge.
      let viewportLeft = wrapRect.left;
      viewportLeft = Math.min(viewportLeft, Math.max(maxLeft, minLeft));
      viewportLeft = Math.max(viewportLeft, minLeft);
      setPanelLeft(viewportLeft - wrapRect.left);
    };

    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-panel px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink disabled:opacity-40"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>{t.themes[active.id].label}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute top-[calc(100%+8px)] z-40 grid w-[min(88vw,320px)] grid-cols-2 gap-2 rounded-2xl border-2 border-ink bg-panel p-3 shadow-[6px_6px_0_0_rgb(var(--ink))]"
          style={{
            left: panelLeft ?? 0,
            // Keep it invisible for the one frame before we've measured and
            // clamped its position, instead of flashing at the wrong spot.
            visibility: panelLeft === null ? "hidden" : "visible",
          }}
        >
          {THEMES.map((theme) => {
            const isActive = theme.id === settings.themeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-xl border-2 p-2.5 text-start transition-transform hover:-translate-y-0.5",
                  isActive ? "border-accent bg-accent/10" : "border-ink/20",
                )}
              >
                <span className="text-lg leading-none">{theme.emoji}</span>
                <span className="text-xs font-bold leading-tight text-ink">{t.themes[theme.id].label}</span>
                <span className="text-[10px] leading-tight text-muted">{t.themes[theme.id].tagline}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
