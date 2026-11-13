# Archived: Halloween theme

Halloween is archived, not deleted. Users cannot pick it, but the code and
artwork are all still here.

| What | Where |
|---|---|
| Theme definition (`halloween`) | `lib/archive/halloween/theme.ts` |
| 13 template layouts (`HALLOWEEN_LAYOUTS`) | `lib/archive/halloween/layouts.ts` |
| Artwork (PNG) | `public/themes/halloween/` (left in place) |
| Translations (`halloween`, `halloween-*`) | `lib/translations/en.ts` and `ar.ts` (kept) |
| `"halloween"` / `"halloween-*"` ids | `StripThemeId` / `LayoutId` in `types.ts` (kept, marked archived) |
| Icon | `lib/theme-icons.tsx` (kept) |

The template mechanism itself (`LayoutTemplate`, `lib/template-renderer.ts`,
`lib/decor/template-date.ts`, and the `layoutDef.template` branch in
`lib/strip-renderer.ts`) is still live. It just has no template layouts
registered.

## How to restore it

1. Move the files back:
   - `lib/archive/halloween/theme.ts` to `lib/themes/halloween.ts`
   - `lib/archive/halloween/layouts.ts` to `lib/layouts/templates/halloween.ts`
2. `lib/themes/index.ts`: import `halloween` and add it to `THEMES`.
3. `lib/layouts/index.ts`: import `HALLOWEEN_LAYOUTS` and set
   `TEMPLATE_LAYOUTS = [...HALLOWEEN_LAYOUTS]`.
4. `hooks/use-session-store.tsx`: add `"halloween"` to `VALID_THEMES`.
5. `lib/theme-categories.ts`: add `"halloween"` to a category (it was in `playful`).

Until step 3, a saved `halloween` / `halloween-*` selection is ignored and the
app falls back to the default theme and layout.
