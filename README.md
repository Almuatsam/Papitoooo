# Photo Booth

A whimsical, Y2K-inspired web photo booth built around one thing: the classic
**four-photo film strip**. Open the site, pick your vibe, allow the camera, and
it takes four photos automatically — each with a 3‑2‑1 countdown and a flash.
Then decorate the strip with stickers and emoji, add a caption, and download a
print-resolution PNG.

Everything runs in the browser. **Your photos never leave your device** — there
is no server, no upload, no account. English and Arabic (full RTL) are both
first-class.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS 3 — theme tokens as CSS custom properties, six `[data-theme]` skins
- Fabric.js 6 — strip compositing and the interactive sticker editor (loaded on demand, client only)
- Canvas 2D — per-photo filtering/cropping and decorative patterns/textures

The camera handling, frame capture, flash effect, countdown timing and download
helper are adapted from the open-source
[`tedy69/photobooth`](https://github.com/tedy69/photobooth) project and are
functionally unchanged. Everything else — visual identity, the six-theme
system, filters, stickers/emoji, and the English/Arabic UI — is new.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. `getUserMedia` requires a secure context, so the
camera works on `localhost` and over HTTPS only.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

## Vibes (strip themes)

Six full app re-skins, picked from a "✨ Vibe" switcher on any screen and
persisted to `localStorage`: **Classic**, **Y2K Digital Camera** (chrome +
flash HUD, default), **Glitter Scrapbook** (tape + handwritten captions),
**Pop Magazine** (bold cover-line typography), **Retro Internet** (pixel font
+ checker/marquee), **Cute Photo Booth** (bows, hearts, bubble type). Each
theme changes typography, borders, patterns, decoration, background treatment
and button styling — not just colour.

## How it works

| Concern | Where |
| --- | --- |
| Camera stream lifecycle | `hooks/use-camera.ts`, `lib/camera-utils.ts` |
| 4-shot capture flow (countdown → flash → capture → review) | `hooks/use-photo-session.ts` |
| Filters (CSS string, same for preview and export) | `lib/filters.ts` |
| Theme definitions (palette tokens live in `app/globals.css`, composition here) | `lib/themes.ts` |
| Theme chrome (per-screen decoration slots) | `components/theme/*`, `components/theme/decor/*` |
| Decorative patterns / textures / shapes (canvas + CSS, one source each) | `lib/decor/*` |
| Sticker collections (curated inline SVG) | `lib/decor/stickers.tsx` |
| Interactive sticker editor (Fabric.js canvas: drag/resize/rotate/duplicate/layer) | `components/result/sticker-canvas.tsx` |
| Strip compositor (single source of truth for preview + download, stickers baked in for export) | `lib/strip-renderer.ts` |
| English/Arabic + RTL | `hooks/use-language.tsx`, `lib/translations/{en,ar}.ts` |
| Session state (frames + settings + current screen) | `hooks/use-session-store.tsx` |

Filters are baked into every one of the four photos — not laid over the
finished strip — so what you preview on the camera screen is exactly what you
download. The strip preview and the export share one renderer, and every
colour/font it uses is read live from the active theme's CSS, so they can
never drift out of sync. Captions (including Arabic) are baked as a bitmap via
native canvas text shaping rather than Fabric's text engine, so RTL text
renders correctly.
