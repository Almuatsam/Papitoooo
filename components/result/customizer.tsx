"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/hooks/use-language";
import { FilterCarousel } from "@/components/camera/filter-carousel";
import { StickerTray } from "@/components/result/sticker-tray";
import { ThemeBrowser } from "@/components/result/theme-browser";
import { BORDER_SWATCHES, BG_SWATCHES } from "@/lib/themes";
import type { SessionSettings } from "@/types";

interface CustomizerProps {
  settings: SessionSettings;
  onChange: (patch: Partial<SessionSettings>) => void;
  onAddStickerSvg: (svg: string) => void;
  onAddEmoji: (emoji: string) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
      {children}
    </div>
  );
}

function Swatches({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: string[];
  onSelect: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((color) => {
        const active = color === value;
        return (
          <button
            key={color || "default"}
            type="button"
            aria-label={color || "theme default"}
            aria-pressed={active}
            onClick={() => onSelect(color)}
            className={cn(
              "h-9 w-9 rounded-full border-3 border-line transition-transform",
              active && "ring-4 ring-accent/50",
              !color && "bg-[repeating-linear-gradient(45deg,#3a3a42,#3a3a42_4px,#222227_4px,#222227_8px)]",
            )}
            style={color ? { backgroundColor: color } : undefined}
          />
        );
      })}
    </div>
  );
}

export function Customizer({ settings, onChange, onAddStickerSvg, onAddEmoji }: CustomizerProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Field label={t.result.filter}>
        <FilterCarousel value={settings.filterId} onChange={(filterId) => onChange({ filterId })} />
      </Field>

      <Field label={t.result.vibe}>
        <ThemeBrowser themeId={settings.themeId} onSelect={(themeId) => onChange({ themeId })} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t.result.border}>
          <Swatches value={settings.borderColor} options={BORDER_SWATCHES} onSelect={(borderColor) => onChange({ borderColor })} />
        </Field>
        <Field label={t.result.background}>
          <Swatches value={settings.bgColor} options={BG_SWATCHES} onSelect={(bgColor) => onChange({ bgColor })} />
        </Field>
      </div>

      <Field label={t.result.caption}>
        <input
          type="text"
          value={settings.caption}
          maxLength={28}
          placeholder={t.result.captionPlaceholder}
          onChange={(e) => onChange({ caption: e.target.value })}
          className="facet-sm w-full border-3 border-line bg-panel px-3 py-2 text-base font-medium text-ink outline-none placeholder:text-muted focus-visible:ring-4 focus-visible:ring-accent/40"
        />
      </Field>

      <Field label={t.result.date}>
        <button
          type="button"
          aria-pressed={settings.showDate}
          onClick={() => onChange({ showDate: !settings.showDate })}
          className={cn(
            "facet-sm border-2 border-line px-4 py-1.5 text-sm font-bold uppercase tracking-wide",
            settings.showDate ? "bg-accent text-white" : "bg-panel hover:bg-white/5",
          )}
        >
          {settings.showDate ? t.result.shown : t.result.hidden}
        </button>
      </Field>

      <Field label={t.result.stickers}>
        <StickerTray themeId={settings.themeId} onAddSvg={onAddStickerSvg} onAddEmoji={onAddEmoji} />
      </Field>
    </div>
  );
}
