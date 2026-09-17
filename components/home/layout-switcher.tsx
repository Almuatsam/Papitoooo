"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import { LAYOUTS } from "@/lib/layouts";
import { getTheme } from "@/lib/themes";
import { useSession } from "@/hooks/use-session-store";
import { useLanguage } from "@/hooks/use-language";

const VIEWPORT_MARGIN = 12;
const DIAGRAM_W = 34;
const DIAGRAM_H = 46;

/** A tiny box diagram of a layout's arrangement — layouts are about shape, not material, so a simple CSS diagram (matching the brief's own reference sheets) is both accurate and far cheaper than a full canvas render. */
function LayoutDiagram({ layoutId }: { layoutId: (typeof LAYOUTS)[number]["id"] }) {
  const { settings } = useSession();
  const theme = getTheme(settings.themeId);
  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[1];
  const { canvasW, canvasH, boxes } = layout.computeLayout(theme);
  const fit = Math.min(DIAGRAM_W / canvasW, DIAGRAM_H / canvasH);

  return (
    <span
      className="relative block shrink-0 border border-line/50 bg-panel"
      style={{ width: DIAGRAM_W, height: DIAGRAM_H }}
      aria-hidden
    >
      {boxes.map((box, i) => (
        <span
          key={i}
          className="absolute border border-line/70 bg-accent/25"
          style={{
            left: box.left * fit,
            top: box.top * fit,
            width: Math.max(2, box.width * fit),
            height: Math.max(2, box.height * fit),
          }}
        />
      ))}
    </span>
  );
}

/** Layout must be chosen before capture starts — it determines shot count — so unlike ThemeSwitcher this only appears on Home, with no "disabled" variant for mid-session use. */
export function LayoutSwitcher() {
  const { settings, setLayout } = useSession();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelLeft, setPanelLeft] = useState<number | null>(null);
  const active = LAYOUTS.find((l) => l.id === settings.layoutId) ?? LAYOUTS[1];

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
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="facet-sm inline-flex items-center gap-1.5 border-2 border-line bg-panel px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink"
      >
        <LayoutGrid className="h-3.5 w-3.5 text-accent" />
        <span>{t.layouts[active.id].label}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="facet absolute top-[calc(100%+8px)] z-40 grid w-[min(92vw,340px)] grid-cols-3 gap-2 border-2 border-line bg-panel p-3 shadow-[0_0_24px_rgb(var(--accent)/0.35)]"
          style={{
            left: panelLeft ?? 0,
            visibility: panelLeft === null ? "hidden" : "visible",
          }}
        >
          {LAYOUTS.map((layout) => {
            const isActive = layout.id === settings.layoutId;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => {
                  setLayout(layout.id);
                  setOpen(false);
                }}
                className={cn(
                  "facet-sm flex flex-col items-center gap-1 border-2 p-2 text-center transition-transform hover:-translate-y-0.5",
                  isActive ? "border-accent bg-accent/10" : "border-line/40",
                )}
              >
                <LayoutDiagram layoutId={layout.id} />
                <span className="text-[10px] font-bold leading-tight text-ink">{t.layouts[layout.id].label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
