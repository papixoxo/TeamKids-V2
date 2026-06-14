import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/scroll'
import styles from './Preloader.module.css'

const WARM = ['/assets/logo.webp', '/assets/earth-mask.png', '/assets/mrbeast.webp', '/assets/markrober.webp', '/assets/khabylame.webp']

/** Cinematic warm-up: preloads hero art, counts to 100, lifts a curtain. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const countEl = useRef<HTMLSpanElement>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      if (prefersReducedMotion()) {
        setHidden(true)
        onDone()
        return
      }
      const tl = gsap.timeline({ onComplete: () => setHidden(true) })
      tl.to(`.${styles.center}`, { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' })
        .to(`.${styles.panel}`, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 0.9,
          ease: 'power4.inOut',
          stagger: 0.06,
        }, '-=0.1')
        .add(() => onDone(), '-=0.55')
    }

    // count 0 → 100 paced with asset loading
    const counter = { v: 0 }
    const tween = gsap.to(counter, {
      v: 100,
      duration: 2.1,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (countEl.current) countEl.current.textContent = String(Math.round(counter.v))
      },
    })

    let loaded = 0
    const onOne = () => {
      loaded++
      if (loaded >= WARM.length) {
        // ensure the count visually completes, then finish
        gsap.to(counter, { v: 100, duration: 0.3, onComplete: finish })
      }
    }
    WARM.forEach((src) => {
      const img = new Image()
      img.onload = onOne
      img.onerror = onOne
      img.src = src
    })
    // hard cap so we never hang on a slow asset
    const cap = window.setTimeout(finish, 3500)

    return () => {
      tween.kill()
      window.clearTimeout(cap)
    }
  }, [onDone])

  if (hidden) return null

  return (
    <div className={styles.loader} ref={root} aria-hidden="true">
      <div className={styles.panels}>
        <span className={styles.panel} />
        <span className={styles.panel} />
        <span className={styles.panel} />
        <span className={styles.panel} />
      </div>
      <div className={styles.center}>
        <img src="/assets/logo.webp" alt="" className={styles.logo} width={72} height={72} />
        <div className={styles.brand}>TEAM<span>KIDS</span></div>
        <div className={styles.meta}>
          <span className={styles.tagline}>Preparing tonight's deliveries</span>
          <span className={styles.count}><span ref={countEl}>0</span>%</span>
        </div>
      </div>
    </div>
  )
}
