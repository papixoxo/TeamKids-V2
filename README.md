# TeamKids V2 — "The Map of Hunger"

A cinematic, **single-globe** interactive experience for **TeamKids** (`#TEAM KIDS`).
One WebGL planet anchors the whole site: **drag to spin it**, and as you scroll
the Earth rotates region to region — lighting real hunger hotspots and drawing
glowing arcs of aid toward them — before asking you to light one yourself.

> A deliberately different concept from V1 (which followed one delivery box).
> Here the hero, the storytelling mechanic, and every section are built around a
> procedural dot-globe — no drone/box/truck art at all.

## The experience
- **Sticky dot-globe** (three.js): continents are ~13k points sampled from a land
  mask, wrapped in a fresnel atmosphere glow, with pulsing hunger hotspots.
- **Scrollytelling**: the globe is pinned (CSS `sticky`) while story "steps"
  scroll past. Each step rotates the planet to a region (Sahel, Horn of Africa,
  Yemen, Afghanistan), brightens its hotspot, and **draws an aid-arc** from a hub
  with a travelling comet-head — while a card reveals that region's story + stat.
- **Drag to spin**: pointer-drag rotates the globe; it auto-rotates when idle.
- **Voices**: an infinite auto-scrolling marquee of creator ambassadors
  (grayscale → colour on hover), not tilt-cards.
- **Give**: bold amount-tier cards (no slider), each opening the donate modal.
- A final "light the whole map" beat lights every arc at once.

## Stack
- **Vite + React 18 + TypeScript** (ESM, strict)
- **three.js** — the procedural dot-globe, atmosphere shader, arcs & hotspots
- **GSAP + ScrollTrigger** — step triggers that drive the globe + reveals
- **Lenis** — inertia smooth scroll, synced to GSAP's ticker
- **CSS Modules** + one global token sheet (`src/styles/global.css`)
- Type: **Fraunces** (editorial serif) + **Inter** (body); dark "ember" palette

## Commands
```bash
npm install
npm run dev      # Vite dev server → http://localhost:5174
npm run build    # tsc -b && vite build
npm run preview  # serve the production build
```

## Layout
```
index.html              SEO/OG meta, fonts, favicon
src/
  main.tsx              entry — adds .js flag; NO React.StrictMode
  App.tsx               composition + donate-modal state + smooth-scroll boot
  lib/scroll.ts         Lenis + GSAP/ScrollTrigger, scrollTo, stop/startScroll,
                        prefersReducedMotion, isTouch
  lib/useReveal.ts      shared [data-reveal] scroll-in reveal hook
  styles/global.css     design tokens, buttons, reduced motion (overflow-x: clip
                        so it never breaks the sticky globe)
  components/
    Preloader, Cursor, ScrollProgress, Nav,
    GlobeStage (three.js globe + scrollytelling),
    Voices (marquee), Give (tiers), DonateModal, Footer
public/assets/
  earth-mask.png        land/sea mask the globe samples for dot placement
  logo.webp, mrbeast/markrober/khabylame/shouzichew.webp   (ambassadors)
assets/                 original source art (not shipped)
```

## How the globe works
`GlobeStage.tsx` loads `earth-mask.png`, samples it on a Fibonacci sphere, and
keeps only the land points as a `THREE.Points` cloud. Hotspots are additive
sprites at region lat/lons; arcs are `TubeGeometry` along slerped great-circles,
revealed with `setDrawRange`. A small `view` state object is eased toward a
target rotation each frame; `ScrollTrigger`s (one per step) set that target, and
pointer-drag overrides it. Reduced-motion renders the globe once (static) and
shows all content immediately.

## Mobile & a11y
- `gsap.matchMedia` / `prefers-reduced-motion` honored; globe is static and
  text shows immediately under reduced motion. Verified: **no horizontal
  overflow at 390px**, drag uses `touch-action: pan-y` so vertical scroll works.

## Placeholders to wire later (`TODO` in code)
- Donate flow (`DonateModal.tsx`) → real provider / checkout.
- Region stats, `$/child` ratios, impact numbers → real data / CMS.
- Footer links (annual report, become an ambassador, contact).

## Ambassadors note
The four creators are real public figures shown illustratively (a visible
disclaimer says so). Do not imply confirmed endorsement until likeness /
partnership rights are secured in writing.

## Assets
The land mask is derived from a public-domain NASA Blue Marble equirectangular
image (thresholded to a clean land/sea bitmap). Ambassador photos are optimized
to WebP. Total shipped assets ≈ 0.5 MB.
# TeamKids-V2
