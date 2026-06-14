import { scrollTo } from '../lib/scroll'
import styles from './Footer.module.css'

const NAV = [
  { href: '#map', label: 'The map' },
  { href: '#voices', label: 'Voices' },
  { href: '#give', label: 'Give' },
]

export default function Footer({ onDonate }: { onDonate: () => void }) {
  const year = 2026
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.glow} aria-hidden="true" />
      <div className={`wrap ${styles.top}`}>
        <h2 className={styles.cta}>
          Somewhere, a child is waiting. <span className="text-amber">Don’t make them wait longer.</span>
        </h2>
        <button className={`btn btn--primary ${styles.btn}`} data-magnetic onClick={onDonate}>Feed a child tonight</button>
      </div>

      <div className={`wrap ${styles.grid}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img src="/assets/logo.webp" alt="" width={40} height={40} />
            <span>Team<b>Kids</b></span>
          </div>
          <p>No child should sleep hungry. We move food from where it is to the children who need it — fast.</p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          <span className={styles.colTitle}>Explore</span>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => { e.preventDefault(); scrollTo(n.href) }}>{n.label}</a>
          ))}
        </nav>

        <nav className={styles.links} aria-label="Organisation">
          <span className={styles.colTitle}>Organisation</span>
          {/* TODO: wire these to real pages */}
          <a href="#" onClick={(e) => e.preventDefault()}>Annual report</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Become an ambassador</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
        </nav>
      </div>

      <div className={`wrap ${styles.legal}`}>
        <span>© {year} TeamKids. A demo experience.</span>
        <span>Made with care · #TEAM KIDS</span>
      </div>
    </footer>
  )
}
