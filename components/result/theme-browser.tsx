"use client";

import { useLanguage } from "@/hooks/use-language";
import { THEMES } from "@/lib/themes";
import { THEME_CATEGORIES } from "@/lib/theme-categories";
import { ThemePreviewCard } from "@/components/result/theme-preview-card";
import type { StripThemeId } from "@/types";

const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

interface ThemeBrowserProps {
  themeId: StripThemeId;
  onSelect: (themeId: StripThemeId) => void;
}

/** Categorized, horizontally-scrolling theme picker — replaces a flat button row now that there are 15 themes. */
export function ThemeBrowser({ themeId, onSelect }: ThemeBrowserProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {THEME_CATEGORIES.map((category) => (
        <div key={category.id} className="space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-muted">
            {t.themeCategories[category.id]}
          </span>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {category.themeIds.map((id) => {
              const theme = THEME_BY_ID.get(id);
              if (!theme) return null;
              return (
                <ThemePreviewCard
                  key={id}
                  theme={theme}
                  label={t.themes[id].label}
                  active={id === themeId}
                  onClick={() => onSelect(id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
