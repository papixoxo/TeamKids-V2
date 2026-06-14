import { useEffect } from 'react'
import { gsap, prefersReducedMotion, isTouch } from '../lib/scroll'
import styles from './Cursor.module.css'

/**
 * Dual cursor (precise dot + trailing ring) with magnetic pull on
 * [data-magnetic] targets and a grow state over interactives.
 * Desktop / fine-pointer only.
 */
export default function Cursor() {
  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return

    const dot = document.createElement('div')
    const ring = document.createElement('div')
    dot.className = `${styles.dot} cursor-dot`
    ring.className = `${styles.ring} cursor-ring`
    document.body.append(dot, ring)
    document.body.style.cursor = 'none'

    const xTo = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' })
    const dx = gsap.quickTo(dot, 'x', { duration: 0.07, ease: 'power2' })
    const dy = gsap.quickTo(dot, 'y', { duration: 0.07, ease: 'power2' })

    const move = (e: PointerEvent) => {
      xTo(e.clientX); yTo(e.clientY); dx(e.clientX); dy(e.clientY)
    }
    window.addEventListener('pointermove', move)

    const over = () => ring.classList.add(styles.grow)
    const out = () => ring.classList.remove(styles.grow)
    const els = Array.from(document.querySelectorAll('a, button, input[type=range], [data-magnetic]'))
    els.forEach((el) => {
      el.addEventListener('pointerenter', over)
      el.addEventListener('pointerleave', out)
    })

    const magnets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const handlers = magnets.map((el) => {
      const m = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.3,
          y: (e.clientY - (r.top + r.height / 2)) * 0.4,
          duration: 0.4, ease: 'power3',
        })
      }
      const l = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
      el.addEventListener('pointermove', m as EventListener)
      el.addEventListener('pointerleave', l)
      return { el, m, l }
    })

    return () => {
      window.removeEventListener('pointermove', move)
      els.forEach((el) => {
        el.removeEventListener('pointerenter', over)
        el.removeEventListener('pointerleave', out)
      })
      handlers.forEach(({ el, m, l }) => {
        el.removeEventListener('pointermove', m as EventListener)
        el.removeEventListener('pointerleave', l)
      })
      dot.remove(); ring.remove()
      document.body.style.cursor = ''
    }
  }, [])

  return null
}
