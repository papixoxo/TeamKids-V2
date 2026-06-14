import { useReveal } from '../lib/useReveal'
import styles from './Give.module.css'

// TODO: placeholder amounts/impact — wire to real program data
const TIERS = [
  { amount: 25, big: '2 weeks', text: 'of warm meals for one child' },
  { amount: 50, big: 'a month', text: 'a child fed, every single day' },
  { amount: 120, big: '8 children', text: 'fed for a week, in one box run' },
  { amount: 300, big: 'a family', text: 'nourished through a whole season' },
]

export default function Give({ onDonate }: { onDonate: (amount?: number) => void }) {
  const scope = useReveal<HTMLElement>()
  return (
    <section className={styles.give} id="give" ref={scope} aria-label="Make a donation">
      <div className={styles.glow} aria-hidden="true" />
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow" data-reveal>Light a region</p>
          <h2 data-reveal="1">Pick a number. <span className="text-amber">Watch it become a meal.</span></h2>
          <p className={styles.sub} data-reveal="2">
            No drones, no slogans — just food, moving from where it is to a child who needs it.
            Choose a gift and we’ll show you exactly where it lands.
          </p>
        </div>

        <div className={styles.tiers}>
          {TIERS.map((t, i) => (
            <button className={styles.tier} key={t.amount} data-reveal={String(i + 1)} onClick={() => onDonate(t.amount)}>
              <span className={styles.amt}>${t.amount}</span>
              <span className={styles.big}>{t.big}</span>
              <span className={styles.txt}>{t.text}</span>
              <span className={styles.go} aria-hidden="true">Give ${t.amount} →</span>
            </button>
          ))}
        </div>

        <div className={styles.footerRow} data-reveal="5">
          <button className="btn btn--primary" data-magnetic onClick={() => onDonate()}>Give another amount</button>
          <span className={styles.fine}>Secure checkout · cancel anytime · 94¢ of every $1 reaches programs</span>
        </div>
      </div>
    </section>
  )
}
