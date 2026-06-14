import { useReveal } from '../lib/useReveal'
import styles from './Voices.module.css'

type V = { name: string; role: string; img: string }
const PEOPLE: V[] = [
  { name: 'MrBeast', role: 'Creator · Philanthropist', img: '/assets/mrbeast.webp' },
  { name: 'Mark Rober', role: 'Engineer · Creator', img: '/assets/markrober.webp' },
  { name: 'Khaby Lame', role: 'Creator', img: '/assets/khabylame.webp' },
  { name: 'Shou Zi Chew', role: 'Tech leader', img: '/assets/shouzichew.webp' },
]
// duplicated so the marquee can loop seamlessly
const LOOP = [...PEOPLE, ...PEOPLE, ...PEOPLE]

export default function Voices() {
  const scope = useReveal<HTMLElement>()
  return (
    <section className={styles.voices} id="voices" ref={scope} aria-label="Voices championing the cause">
      <div className="wrap">
        <div className={styles.head}>
          <p className="eyebrow" data-reveal>Voices for the voiceless</p>
          <h2 data-reveal="1">When the people the world watches <span className="text-amber">point at hunger</span>, the world looks.</h2>
        </div>
      </div>

      <div className={styles.marquee} data-reveal="2" aria-hidden="true">
        <div className={styles.track}>
          {LOOP.map((p, i) => (
            <figure className={styles.item} key={i}>
              <div className={styles.media}><img src={p.img} alt="" loading="lazy" /></div>
              <figcaption>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.role}>{p.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="wrap">
        <p className={styles.note} data-reveal="3">
          Creators shown illustrate the kind of voices championing child-hunger relief.
        </p>
      </div>
    </section>
  )
}
