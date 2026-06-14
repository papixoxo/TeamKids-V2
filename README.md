# TeamKids V2 — "The Map of Hunger"

A cinematic, **single-globe** interactive experience for **TeamKids** (`#TEAM KIDS`).
One WebGL planet anchors the whole site: **drag to spin it**, and as you scroll
the Earth rotates region to region — lighting real hunger hotspots and drawing
glowing arcs of aid toward them — before asking you to light one yourself.

> A deliberately different concept from V1 (which followed one delivery box).
> Here the hero, the storytelling mechanic, and every section are built around a
> procedural dot-globe — no drone/box/truck art at all.

## The story (top to bottom)
1. **The map** — a sticky dot-globe (three.js, ~13k land points from a mask) with
   a fresnel atmosphere and pulsing hunger hotspots. **Drag to spin**; scrolling
   rotates it region to region (Sahel, Horn of Africa, Yemen, Afghanistan),
   brightening each hotspot and **drawing an aid-arc** from a hub with a
   travelling comet-head while a card tells that region's story.
2. **Meet Amara** — the camera leaves the map for one face. The child render
   appears cold and desaturated; emotional copy ends on a cliff-hanger: "Unless —".
3. **The journey of your gift** — a pinned, cross-dissolving cinematic reel with
   procedural ember particles: **drone → truck → food box** (all four renders),
   each a beat of where your gift goes the night you give.
4. **Tonight, she eats** — the payoff: the *same* child render, now warm and
   radiant, with a breathing halo and rising embers. The emotional climax + CTA.
5. **Impact** — count-up proof ("Amara is one of millions").
6. **Voices** — an infinite marquee of creator ambassadors (grayscale → colour).
7. **Give** — bold amount-tier cards, each opening the donate modal.
8. **Footer** — final call to action.

Every supplied asset is used (globe mask, drone, truck, food, child ×2, logo,
four ambassadors). New visuals are generated procedurally — the dot-globe, a
canvas ember field in the journey, CSS embers in the payoff, and an SVG route
indicator — so nothing feels sparse.

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
    Meet (Amara, cold), Journey (pinned cross-dissolve reel),
    Payoff (Amara, warm), Impact (count-ups),
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
