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
      style={{
        maskImage: "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
      }}
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
              "facet-sm inline-flex min-h-11 shrink-0 items-center justify-center border-2 border-line px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-40",
              active ? "bg-accent text-paper" : "bg-panel text-ink hover:bg-white/10",
            )}
          >
            {t.filters[filter.id]}
          </button>
        );
      })}
    </div>
  );
}
