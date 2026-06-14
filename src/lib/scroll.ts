import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

let lenis: Lenis | null = null

/**
 * Boots Lenis smooth scrolling, wired into GSAP's ticker + ScrollTrigger so
 * scrubbed / pinned animations stay frame-perfect. No-ops under reduced motion.
 */
export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) {
    ScrollTrigger.refresh()
    return () => {}
  }

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  })
  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  ScrollTrigger.refresh()

  return () => {
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollTo(target: string | number, opts?: { offset?: number }) {
  if (lenis) {
    lenis.scrollTo(target, { offset: opts?.offset ?? 0, duration: 1.3 })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

/** Freeze / resume the page behind modal overlays. */
export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()

export { gsap, ScrollTrigger }
