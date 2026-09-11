"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { THEMES } from "@/lib/themes";
import { THEME_ICONS } from "@/lib/theme-icons";
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
  const ActiveIcon = THEME_ICONS[active.id];

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
        className="facet-sm inline-flex items-center gap-1.5 border-2 border-line bg-panel px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink disabled:opacity-40"
      >
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span>{t.themes[active.id].label}</span>
        <ActiveIcon className="h-3.5 w-3.5 text-accent2" />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="facet absolute top-[calc(100%+8px)] z-40 grid w-[min(88vw,320px)] grid-cols-2 gap-2 border-2 border-line bg-panel p-3 shadow-[0_0_24px_rgb(var(--accent)/0.35)]"
          style={{
            left: panelLeft ?? 0,
            // Keep it invisible for the one frame before we've measured and
            // clamped its position, instead of flashing at the wrong spot.
            visibility: panelLeft === null ? "hidden" : "visible",
          }}
        >
          {THEMES.map((theme) => {
            const isActive = theme.id === settings.themeId;
            const Icon = THEME_ICONS[theme.id];
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setTheme(theme.id);
                  setOpen(false);
                }}
                className={cn(
                  "facet-sm flex flex-col items-start gap-0.5 border-2 p-2.5 text-start transition-transform hover:-translate-y-0.5",
                  isActive ? "border-accent bg-accent/10" : "border-line/40",
                )}
              >
                <Icon className="h-4 w-4 text-accent" />
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
