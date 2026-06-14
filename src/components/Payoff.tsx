import { useReveal } from '../lib/useReveal'
import styles from './Payoff.module.css'

export default function Payoff({ onDonate }: { onDonate: (amount?: number) => void }) {
  const scope = useReveal<HTMLElement>()
  return (
    <section className={styles.payoff} id="payoff" ref={scope} aria-label="Amara eats tonight">
      <div className={styles.embers} aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${(i * 7 + 4) % 100}%`, animationDelay: `${(i % 7) * 0.8}s`, animationDuration: `${7 + (i % 5)}s` }} />)}
      </div>

      <div className={`wrap ${styles.inner}`}>
        <p className="eyebrow" data-reveal>And then — the part that matters</p>

        <div className={styles.figure} data-reveal="1">
          <div className={styles.halo} aria-hidden="true" />
          <img src="/assets/child.webp" alt="Amara smiling, holding an open box of food" />
        </div>

        <h2 className={styles.head} data-reveal="2">
          Amara opens the box.<br /><span className="text-amber">Tonight, he eats.</span>
        </h2>
        <p className={styles.body} data-reveal="3">
          The same boy. The same night. One box changed how it ends. Multiply that by everyone
          who decides not to scroll past — and you start to see how a map full of dark corners
          comes back to light.
        </p>
        <div className={styles.cta} data-reveal="4">
          <button className="btn btn--primary" data-magnetic onClick={() => onDonate()}>Send a box tonight</button>
          <span className={styles.note}>$50 feeds a child every day for a month</span>
        </div>
      </div>
    </section>
  )
}
