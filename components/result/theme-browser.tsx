"use client";

import { useLanguage } from "@/hooks/use-language";
import { THEMES } from "@/lib/themes";
import { THEME_CATEGORIES } from "@/lib/theme-categories";
import type { StripThemeId } from "@/types";

const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

interface ThemeBrowserProps {
  themeId: StripThemeId;
  onSelect: (themeId: StripThemeId) => void;
}

/** A compact grouped dropdown theme picker — the card-grid-with-previews design was sized for the original 15-theme catalog; at 5 themes a select takes a fraction of the space. */
export function ThemeBrowser({ themeId, onSelect }: ThemeBrowserProps) {
  const { t } = useLanguage();

  return (
    <select
      value={themeId}
      onChange={(e) => onSelect(e.target.value as StripThemeId)}
      className="facet-sm w-full border-3 border-line bg-panel px-3 py-2 text-base font-bold uppercase tracking-wide text-ink outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
    >
      {THEME_CATEGORIES.map((category) => (
        <optgroup key={category.id} label={t.themeCategories[category.id]}>
          {category.themeIds.map((id) => {
            if (!THEME_BY_ID.has(id)) return null;
            return (
              <option key={id} value={id}>
                {t.themes[id].label}
              </option>
            );
          })}
        </optgroup>
      ))}
    </select>
  );
}
