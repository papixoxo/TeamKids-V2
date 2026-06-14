import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/scroll'
import styles from './Journey.module.css'

type Beat = { n: string; tag: string; title: string; body: string; img: string; alt: string }
const BEATS: Beat[] = [
  { n: '01', tag: 'The night you give', title: 'A drone lifts off', img: '/assets/drone.webp', alt: 'TeamKids delivery drone carrying a relief box',
    body: 'The second your gift clears, a drone rises into the dark — carrying a box with Amara’s name on it in everything but ink.' },
  { n: '02', tag: 'The last mile', title: 'A convoy crosses the dark', img: '/assets/truck.webp', alt: 'TeamKids relief truck crossing rough terrain at night',
    body: 'Where the roads give out, a convoy takes over — across borders, through the night, toward a village the maps almost forgot.' },
  { n: '03', tag: 'Inside the box', title: 'A week of meals, sealed', img: '/assets/food.webp', alt: 'An open TeamKids relief box full of food',
    body: 'Rice, lentils, oil, clean water. Seven days of meals under one promise — tonight, a child won’t go without.' },
]

export default function Journey() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>(`.${styles.frame}`)
      const caps = gsap.utils.toArray<HTMLElement>(`.${styles.cap}`)
      const dots = gsap.utils.toArray<HTMLElement>(`.${styles.routeDot}`)
      const fill = root.current!.querySelector(`.${styles.routeFill}`) as HTMLElement

      const setActive = (idx: number) => dots.forEach((d, i) => d.classList.toggle(styles.routeOn, i <= idx))

      const mm = gsap.matchMedia()
      mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(frames.slice(1), { opacity: 0 })
        gsap.set(caps.slice(1), { opacity: 0, y: 30 })
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current, start: 'top top', end: '+=' + BEATS.length * 100 + '%',
            scrub: 1, pin: stage.current, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (fill) fill.style.transform = `scaleY(${self.progress})`
              setActive(Math.min(BEATS.length - 1, Math.floor(self.progress * BEATS.length + 0.001)))
            },
          },
        })
        frames.forEach((f, i) => {
          const img = f.querySelector('img')
          tl.fromTo(img, { yPercent: 10, scale: 1.08 }, { yPercent: -10, scale: 1, ease: 'none', duration: 1 }, i)
          if (i < frames.length - 1) {
            // frame + caption cross-fade together so text never lags the image
            tl.to(f, { opacity: 0, duration: 0.35 }, i + 0.72)
              .to(frames[i + 1], { opacity: 1, duration: 0.35 }, '<')
              .to(caps[i], { opacity: 0, y: -24, duration: 0.32 }, '<')
              .fromTo(caps[i + 1], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35 }, '<')
          }
        })
      })

      mm.add('(max-width: 820px), (prefers-reduced-motion: reduce)', () => {
        gsap.set([...frames, ...caps], { opacity: 1, y: 0, clearProps: 'transform' })
        if (prefersReducedMotion()) return
        gsap.utils.toArray<HTMLElement>(`.${styles.beatM}`).forEach((b) => {
          gsap.from(b.querySelectorAll('img, [data-rv]'), {
            y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: b, start: 'top 78%' },
          })
        })
      })
    }, root)

    // ---- procedural ember particles (generated, not an image asset) ----
    let raf = 0
    const cv = canvas.current
    if (cv && !prefersReducedMotion()) {
      const c = cv.getContext('2d')!
      let W = 0, H = 0
      const P = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: 0.3 + Math.random() * 1.6, v: 0.02 + Math.random() * 0.06, a: Math.random() }))
      const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight }
      resize(); window.addEventListener('resize', resize)
      const tick = () => {
        raf = requestAnimationFrame(tick)
        c.clearRect(0, 0, W, H)
        for (const p of P) {
          p.y -= p.v / 100; p.a += 0.01
          if (p.y < -0.05) { p.y = 1.05; p.x = Math.random() }
          const x = p.x * W, y = p.y * H, r = p.s * 1.6
          const g = c.createRadialGradient(x, y, 0, x, y, r * 4)
          g.addColorStop(0, `rgba(255,200,130,${0.5 + Math.sin(p.a) * 0.3})`)
          g.addColorStop(1, 'rgba(255,150,80,0)')
          c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 4, 0, 7); c.fill()
        }
      }
      tick()
      return () => { ctx.revert(); cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    }
    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.journey} id="journey" ref={root} aria-label="The journey of your gift">
      <div className={styles.stage} ref={stage}>
        <canvas className={styles.embers} ref={canvas} aria-hidden="true" />
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.frames}>
          {BEATS.map((b) => (
            <div className={styles.frame} key={b.n}>
              <img src={b.img} alt={b.alt} loading="lazy" />
            </div>
          ))}
        </div>

        <div className={styles.route} aria-hidden="true">
          <span className={styles.routeTrack}><span className={styles.routeFill} /></span>
          {BEATS.map((b) => <span className={styles.routeDot} key={b.n} data-n={b.n} />)}
        </div>

        <div className={styles.caps}>
          {BEATS.map((b) => (
            <figure className={styles.cap} key={b.n}>
              <span className={styles.capTag}><b>{b.n}</b> {b.tag}</span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </figure>
          ))}
        </div>
      </div>

      {/* mobile: simple stacked beats (the sticky reel is desktop-only) */}
      <div className={styles.mobile}>
        {BEATS.map((b) => (
          <div className={styles.beatM} key={b.n}>
            <img src={b.img} alt="" loading="lazy" />
            <div data-rv>
              <span className={styles.capTag}><b>{b.n}</b> {b.tag}</span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
