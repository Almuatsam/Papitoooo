# Photo Booth

A modern web photo booth built around one thing: the classic **four-photo film
strip**. Open the site, allow the camera, pick a filter, and it takes four photos
automatically — each with a 3‑2‑1 countdown and a flash. Then you arrange them
into a vertical strip, choose a style, add an optional caption, and download a
print-resolution PNG.

Everything runs in the browser. **Your photos never leave your device** — there
is no server, no upload, no account.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS 3
- Fabric.js 6 — strip compositing (loaded on demand, client only)
- Canvas 2D — per-photo filtering and cropping

The camera handling, frame capture, flash effect, countdown timing and download
helper are adapted from the open-source
[`tedy69/photobooth`](https://github.com/tedy69/photobooth) project. The UI,
visual identity, filters and strip styles are new.

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

## How it works

| Concern | Where |
| --- | --- |
| Camera stream lifecycle | `hooks/use-camera.ts`, `lib/camera-utils.ts` |
| 4-shot capture flow (countdown → flash → capture → review) | `hooks/use-photo-session.ts` |
| Filters (CSS string, same for preview and export) | `lib/filters.ts` |
| Strip styles (Classic / Minimal / Vintage / Polaroid / Film) | `lib/strip-styles.ts` |
| Strip compositor (single source of truth for preview + download) | `lib/strip-renderer.ts` |
| Session state (frames + settings + current screen) | `hooks/use-session-store.tsx` |

Filters are baked into every one of the four photos — not laid over the finished
strip — so what you preview on the camera screen is exactly what you download.
