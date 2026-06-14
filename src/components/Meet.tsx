import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/scroll'
import { useReveal } from '../lib/useReveal'
import styles from './Meet.module.css'

export default function Meet() {
  const scope = useReveal<HTMLElement>()
  const img = useRef<HTMLDivElement>(null)
  const cold = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(img.current, { y: 60 }, {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      // the cold scrim lifts a touch as she enters view — a flicker of hope
      gsap.fromTo(cold.current, { opacity: 1 }, {
        opacity: 0.55, ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top 80%', end: 'center center', scrub: true },
      })
    }, scope)
    return () => ctx.revert()
  }, [scope])

  return (
    <section className={styles.meet} id="meet" ref={scope} aria-label="Meet Amara">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.visual}>
          <div className={styles.frame} ref={img}>
            <img src="/assets/child.webp" alt="Amara, a young child" />
            <div className={styles.cold} ref={cold} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.copy}>
          <p className="eyebrow" data-reveal>Behind every dot, a face</p>
          <h2 className={styles.head} data-reveal="1">
            This is <span className="text-amber">Amara</span>.
          </h2>
          <p className={styles.body} data-reveal="2">
            He’s six. He likes the colour yellow and the sound of rain on a tin roof.
            He used to laugh easily.
          </p>
          <p className={styles.body} data-reveal="3">
            Tonight — like <strong>733 million</strong> others — he’ll try to fall asleep through the
            ache of an empty stomach. One of a billion small, quiet emergencies the world has learned to scroll past.
          </p>
          <p className={styles.kicker} data-reveal="4">Unless —</p>
        </div>
      </div>
    </section>
  )
}
