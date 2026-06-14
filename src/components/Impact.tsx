import { useEffect } from 'react'
import { gsap, prefersReducedMotion } from '../lib/scroll'
import { useReveal } from '../lib/useReveal'
import styles from './Impact.module.css'

type Stat = { value: number; label: string; group?: boolean; suffix?: string }
const STATS: Stat[] = [
  { value: 2_400_000, label: 'meals delivered', group: true },
  { value: 120_000, label: 'children fed every month', group: true },
  { value: 38, label: 'countries reached' },
  { value: 94, label: 'of every gift reaches programs', suffix: '%' },
]

export default function Impact() {
  const scope = useReveal<HTMLElement>()
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(`.${styles.num}`).forEach((el) => {
        const target = Number(el.dataset.value)
        const group = el.dataset.group === 'true'
        const suffix = el.dataset.suffix ?? ''
        const fmt = (n: number) => (group ? Math.round(n).toLocaleString() : String(Math.round(n))) + suffix
        if (prefersReducedMotion()) { el.textContent = fmt(target); return }
        const o = { v: 0 }
        gsap.to(o, {
          v: target, duration: 2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => { el.textContent = fmt(o.v) },
        })
      })
    }, scope)
    return () => ctx.revert()
  }, [scope])

  return (
    <section className={styles.impact} id="impact" ref={scope} aria-label="Our impact so far">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow" data-reveal>Amara is one of millions</p>
          <h2 data-reveal="1">Showing up, <span className="text-amber">again and again</span>.</h2>
        </div>
        <div className={styles.grid}>
          {STATS.map((s, i) => (
            <div className={styles.cell} key={s.label} data-reveal={String(i + 1)}>
              <div className={styles.num} data-value={s.value} data-group={s.group ? 'true' : 'false'} data-suffix={s.suffix ?? ''}>0{s.suffix}</div>
              <p className={styles.label}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
