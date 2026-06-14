import { useEffect, useRef } from 'react'
import { startScroll, stopScroll } from '../lib/scroll'
import styles from './DonateModal.module.css'

/**
 * Donation flow STUB. No backend in this build — in production "Continue" must
 * hand off to the real provider / checkout. (TODO: wire real provider.)
 */
export default function DonateModal({ open, amount, onClose }: { open: boolean; amount: number | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const f = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex]:not([tabindex="-1"])')
        if (!f || !f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    stopScroll()
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      startScroll()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose} data-lenis-prevent>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className={styles.close} onClick={onClose} aria-label="Close">×</button>
        <img src="/assets/logo.webp" alt="" width={56} height={56} className={styles.logo} />
        <h3 id="donate-title" className={styles.title}>{amount ? `Give $${amount} tonight?` : 'Make a donation'}</h3>
        <p className={styles.body}>
          This is a demo. In production, this securely hands off to TeamKids’
          donation provider to complete your{amount ? ` $${amount}` : ''} gift — and a child eats.
        </p>
        <div className={styles.actions}>
          <button className="btn btn--primary" onClick={onClose}>Continue to checkout</button>
          <button className="btn btn--ghost" onClick={onClose}>Maybe later</button>
        </div>
        <p className={styles.note}>TODO: connect real payment provider.</p>
      </div>
    </div>
  )
}
