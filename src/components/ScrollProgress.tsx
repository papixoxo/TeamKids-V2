import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import styles from './ScrollProgress.module.css'

/** Thin amber progress line pinned to the top of the viewport. */
export default function ScrollProgress() {
  const fill = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (fill.current) gsap.set(fill.current, { scaleX: self.progress })
      },
    })
    return () => st.kill()
  }, [])
  return (
    <div className={styles.bar} aria-hidden="true">
      <div ref={fill} className={styles.fill} />
    </div>
  )
}
