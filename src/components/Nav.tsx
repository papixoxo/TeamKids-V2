import { useEffect, useState } from 'react'
import { gsap, scrollTo } from '../lib/scroll'
import styles from './Nav.module.css'

const LINKS = [
  { href: '#map', label: 'The map' },
  { href: '#campaign', label: 'Live' },
  { href: '#meet', label: 'His story' },
  { href: '#voices', label: 'Voices' },
  { href: '#give', label: 'Give' },
]

export default function Nav({ onDonate }: { onDonate: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    gsap.from(`.${styles.bar}`, { y: -80, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.2, clearProps: 'transform' })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(Boolean) as HTMLElement[]
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (vis) setActive('#' + vis.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6, 1] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) {
      gsap.fromTo(`.${styles.mLink}`, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.08 })
    }
    return () => { document.documentElement.style.overflow = '' }
  }, [open])

  const go = (href: string) => { setOpen(false); scrollTo(href) }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#main" className={styles.skip}>Skip to content</a>
      <div className={styles.bar}>
        <a href="#top" className={styles.brand} aria-label="TeamKids home" onClick={(e) => { e.preventDefault(); go('#top') }}>
          <img src="/assets/logo.webp" alt="" width={34} height={34} />
          <span>Team<b>Kids</b></span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`${styles.link} ${active === l.href ? styles.on : ''}`}
              aria-current={active === l.href ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); go(l.href) }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button className={`btn btn--primary ${styles.cta}`} data-magnetic onClick={onDonate}>Donate</button>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div className={styles.overlay}>
          <nav aria-label="Mobile">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className={styles.mLink} onClick={(e) => { e.preventDefault(); go(l.href) }}>{l.label}</a>
            ))}
          </nav>
          <button className={`btn btn--primary ${styles.mCta} ${styles.mLink}`} onClick={() => { setOpen(false); onDonate() }}>
            Donate now
          </button>
        </div>
      )}
    </header>
  )
}
