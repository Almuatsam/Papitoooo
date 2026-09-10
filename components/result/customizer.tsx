"use client";

import { cn } from "@/lib/cn";
import { FilterCarousel } from "@/components/camera/filter-carousel";
import { STRIP_STYLES, BORDER_SWATCHES, BG_SWATCHES } from "@/lib/strip-styles";
import type { SessionSettings } from "@/types";

interface CustomizerProps {
  settings: SessionSettings;
  onChange: (patch: Partial<SessionSettings>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-widest text-muted">
        {label}
      </span>
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
            aria-label={color || "style default"}
            aria-pressed={active}
            onClick={() => onSelect(color)}
            className={cn(
              "h-9 w-9 border-3 border-ink transition-transform",
              active && "ring-4 ring-accent/40",
              !color && "bg-[repeating-linear-gradient(45deg,#fff,#fff_4px,#ddd_4px,#ddd_8px)]",
            )}
            style={color ? { backgroundColor: color } : undefined}
          />
        );
      })}
    </div>
  );
}

export function Customizer({ settings, onChange }: CustomizerProps) {
  return (
    <div className="space-y-5">
      <Field label="Filter">
        <FilterCarousel
          value={settings.filterId}
          onChange={(filterId) => onChange({ filterId })}
        />
      </Field>

      <Field label="Strip style">
        <div className="flex flex-wrap gap-2">
          {STRIP_STYLES.map((style) => {
            const active = style.id === settings.styleId;
            return (
              <button
                key={style.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ styleId: style.id })}
                className={cn(
                  "border-3 border-ink px-4 py-2 text-sm font-bold uppercase tracking-wide",
                  active ? "bg-accent text-accent-foreground" : "bg-paper hover:bg-ink/10",
                )}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Border">
          <Swatches
            value={settings.borderColor}
            options={BORDER_SWATCHES}
            onSelect={(borderColor) => onChange({ borderColor })}
          />
        </Field>
        <Field label="Background">
          <Swatches
            value={settings.bgColor}
            options={BG_SWATCHES}
            onSelect={(bgColor) => onChange({ bgColor })}
          />
        </Field>
      </div>

      <Field label="Caption">
        <input
          type="text"
          value={settings.caption}
          maxLength={28}
          placeholder="Add a few words…"
          onChange={(e) => onChange({ caption: e.target.value })}
          className="w-full border-3 border-ink bg-paper px-3 py-2 text-base font-medium outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
        />
      </Field>

      <Field label="Date">
        <button
          type="button"
          aria-pressed={settings.showDate}
          onClick={() => onChange({ showDate: !settings.showDate })}
          className={cn(
            "border-3 border-ink px-4 py-2 text-sm font-bold uppercase tracking-wide",
            settings.showDate ? "bg-accent text-accent-foreground" : "bg-paper hover:bg-ink/10",
          )}
        >
          {settings.showDate ? "Shown" : "Hidden"}
        </button>
      </Field>
    </div>
  );
}
