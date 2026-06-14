import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from './scroll'

/**
 * Reveals every [data-reveal] descendant as it scrolls into view.
 * Honors a `data-reveal="<n>"` numeric value as an extra stagger delay (in
 * 0.08s units) for siblings that should cascade. Reduced-motion → shown at once.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, y: 0 })
        return
      }
      items.forEach((node) => {
        const delay = (Number(node.dataset.reveal) || 0) * 0.08
        gsap.fromTo(
          node,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            delay,
            ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 88%' },
          },
        )
      })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}
