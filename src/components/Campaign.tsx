import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/scroll'
import { useReveal } from '../lib/useReveal'
import styles from './Campaign.module.css'

const GOAL = 100_000_000

// TODO: placeholder data — wire to the real donations backend
const LEADERS = [
  { name: 'MrBeast Foundation', amount: 5_200_000, tag: 'Creator' },
  { name: 'Mark Rober', amount: 1_800_000, tag: 'Creator' },
  { name: 'The Chew Family', amount: 1_250_000, tag: 'Shou Zi Chew' },
  { name: 'Khaby Lame', amount: 900_000, tag: 'Creator' },
  { name: 'The Patel Foundation', amount: 500_000, tag: 'Partner' },
  { name: 'Anonymous', amount: 250_000, tag: 'Gift' },
]

const NAMES = ['Aisha', 'Liam', 'Sofia', 'Chen', 'Diego', 'Priya', 'Noah', 'Fatima', 'Omar', 'Maya', 'Anonymous', 'Yuki', 'Hassan', 'Lena']
const AMTS = [25, 50, 50, 100, 100, 250, 500, 1000]
const CITIES = ['London', 'Lagos', 'Toronto', 'Mumbai', 'Berlin', 'São Paulo', 'Tokyo', 'Cairo', 'Sydney', '']

let _id = 0
function makeDonation() {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)]
  const amount = AMTS[Math.floor(Math.random() * AMTS.length)]
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  return { id: ++_id, name, amount, city }
}
const money = (n: number) => '$' + Math.round(n).toLocaleString()

export default function Campaign({ onDonate }: { onDonate: (amount?: number) => void }) {
  const scope = useReveal<HTMLElement>()
  const reduced = prefersReducedMotion()
  const [raised, setRaised] = useState(67_412_338)
  const [feed, setFeed] = useState(() => Array.from({ length: 5 }, makeDonation))
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const a = window.setInterval(() => setRaised((r) => Math.min(GOAL - 1, r + 60 + Math.floor(Math.random() * 540))), 1100)
    const b = window.setInterval(() => setFeed((f) => [makeDonation(), ...f].slice(0, 6)), 2800)
    return () => { window.clearInterval(a); window.clearInterval(b) }
  }, [reduced])

  const pct = (raised / GOAL) * 100
  const donorsToday = 12_480 + (feed[0]?.id ?? 0)

  return (
    <section className={styles.campaign} id="campaign" ref={scope} aria-label="Live donation campaign">
      <div className={styles.glow} aria-hidden="true" />
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow" data-reveal><span className={styles.pulse} /> Live · happening right now</p>
          <h2 data-reveal="1">One hundred million dollars. <span className="text-amber">One child at a time.</span></h2>
        </div>

        {/* goal thermometer */}
        <div className={styles.goal} data-reveal="2">
          <div className={styles.goalTop}>
            <div>
              <span className={styles.raised}>{money(raised)}</span>
              <span className={styles.of}>raised of {money(GOAL)} goal</span>
            </div>
            <div className={styles.pctWrap}>
              <span className={styles.pct}>{pct.toFixed(1)}%</span>
              <span className={styles.donors}>{donorsToday.toLocaleString()} donors today</span>
            </div>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} ref={barRef} style={{ width: `${pct}%` }}>
              <span className={styles.fillGlow} />
            </div>
            <span className={styles.marker} style={{ left: '25%' }} data-l="$25M" />
            <span className={styles.marker} style={{ left: '50%' }} data-l="$50M" />
            <span className={styles.marker} style={{ left: '75%' }} data-l="$75M" />
          </div>
          <button className={`btn btn--primary ${styles.cta}`} data-magnetic onClick={() => onDonate()}>
            Put your name on the board
          </button>
        </div>

        {/* leaderboard + live feed */}
        <div className={styles.cols}>
          <div className={styles.card} data-reveal="3">
            <div className={styles.cardHead}><h3>Top supporters</h3><span>all time</span></div>
            <ol className={styles.board}>
              {LEADERS.map((l, i) => (
                <li className={styles.row} key={l.name}>
                  <span className={`${styles.rank} ${i < 3 ? styles['m' + (i + 1)] : ''}`}>{i + 1}</span>
                  <span className={styles.who}><b>{l.name}</b><em>{l.tag}</em></span>
                  <span className={styles.amt}>{money(l.amount)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.card} data-reveal="4">
            <div className={styles.cardHead}><h3>Live donations</h3><span className={styles.live}><span className={styles.pulse} />live</span></div>
            <ul className={styles.feed}>
              {feed.map((d) => (
                <li className={styles.feedRow} key={d.id}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.feedWho}><b>{d.name}</b>{d.city && <em> · {d.city}</em>}</span>
                  <span className={styles.feedAmt}>{money(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
