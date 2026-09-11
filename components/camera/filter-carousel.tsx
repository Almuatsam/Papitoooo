"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/hooks/use-language";
import { FILTERS } from "@/lib/filters";
import type { FilterId } from "@/types";

interface FilterCarouselProps {
  value: FilterId;
  onChange: (id: FilterId) => void;
  disabled?: boolean;
}

export function FilterCarousel({ value, onChange, disabled }: FilterCarouselProps) {
  const { t } = useLanguage();

  return (
    <div
      className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1"
      role="radiogroup"
      aria-label={t.camera.filter}
    >
      {FILTERS.map((filter) => {
        const active = filter.id === value;
        return (
          <button
            key={filter.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(filter.id)}
            className={cn(
              "shrink-0 rounded-full border-2 border-ink px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-40",
              active ? "bg-accent text-white" : "bg-panel text-ink hover:bg-ink/10",
            )}
          >
            {t.filters[filter.id]}
          </button>
        );
      })}
    </div>
  );
}
