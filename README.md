# Photo Booth

A dark chrome-and-magenta web photo booth. The landing page is an illustrated
booth cabinet — marquee sign, curtained entrance, coin slot, mirror — press
**Start** and it walks you straight into a live capture session: pick a
layout, allow the camera, and it takes your photos automatically with a
countdown and a flash for each shot. Then decorate the result with stickers
and a caption, and download a print-resolution PNG.

Everything runs in the browser. **Your photos never leave your device** —
there is no server, no upload, no account. English and Arabic (full RTL) are
both first-class.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS 3 — design tokens as CSS custom properties; the home hero
  carries its own scoped `--booth-*` token set, separate from the app-wide
  chrome/neon tokens the rest of the app uses
- Fabric.js 6 — strip compositing and the interactive sticker editor (loaded
  on demand, client only)
- Canvas 2D / SVG — per-photo filtering, procedural decoration, and the
  home-screen booth illustration (no raster image assets anywhere)

The camera handling, frame capture, flash effect, countdown timing and
download helper are adapted from the open-source
[`tedy69/photobooth`](https://github.com/tedy69/photobooth) project and are
functionally unchanged. Everything else — the booth hero, the layout system,
the theme system, filters, stickers/emoji, and the English/Arabic UI — is new.

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

## Layouts

Chosen before capture — since the arrangement determines shot count — from
nine options: **Short Strip** (3), **Classic Strip** (4), **Grid Strip**
(6, 2×3), **Single Portrait**, **Single Landscape**, **Triple Wide**, **Big +
Two**, **Uneven Grid**, and **Double Print** (two 4-photo strips side by
side). Layout is independent of theme — any theme can render any layout.

## Themes (strip decoration)

Seven themes, each grounded in a real reference and each with its own
sticker pack, signature decoration, and background treatment: **Festival
Poster**, **Streaming Card**, **Arcade Corkboard** (composites real vector
art — cabinet, joystick — instead of hand-drawn primitives), **Doodle
Diary**, **Boarding Pass**, **Receipt**, **Par Avion**. A theme skins the
photo strip itself; the app shell around it (camera screen, result screen,
the booth hero) keeps one consistent dark chrome/magenta identity regardless
of which theme is active.

## How it works

| Concern | Where |
| --- | --- |
| Booth hero (illustrated cabinet: sign, curtain, coin slot, mirror, strip preview) | `components/home/booth/*` |
| Camera stream lifecycle | `hooks/use-camera.ts`, `lib/camera-utils.ts` |
| Capture flow (countdown → flash → capture → review, shot count from the chosen layout) | `hooks/use-photo-session.ts` |
| Layout definitions (arrangement, box geometry) | `lib/layouts/*` |
| Filters (CSS string, same for preview and export) | `lib/filters.ts` |
| Theme definitions (piece pools, patterns, textures) | `lib/themes/*` |
| App-shell chrome (per-screen decoration slots, theme-independent) | `components/theme/*`, `components/theme/decor/*` |
| Decorative patterns / textures / shapes / real asset compositing | `lib/decor/*` |
| Sticker collections (curated inline SVG) | `lib/decor/sticker-library-*.tsx`, `lib/decor/sticker-registry-core.ts` |
| Interactive sticker editor (Fabric.js canvas: drag/resize/rotate/duplicate/layer) | `components/result/sticker-canvas.tsx` |
| Strip compositor (single source of truth for preview + download, stickers baked in for export) | `lib/strip-renderer.ts` |
| English/Arabic + RTL | `hooks/use-language.tsx`, `lib/translations/{en,ar}.ts` |
| Session state (frames + settings + current screen) | `hooks/use-session-store.tsx` |

Filters are baked into every captured photo — not laid over the finished
strip — so what you preview on the camera screen is exactly what you
download. The strip preview and the export share one renderer, so they can
never drift out of sync. Captions (including Arabic) are baked as a bitmap
via native canvas text shaping rather than Fabric's text engine, so RTL text
renders correctly.
