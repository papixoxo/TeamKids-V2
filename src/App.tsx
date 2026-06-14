import { useCallback, useEffect, useState } from 'react'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import GlobeStage from './components/GlobeStage'
import Voices from './components/Voices'
import Give from './components/Give'
import Footer from './components/Footer'
import DonateModal from './components/DonateModal'
import { initSmoothScroll, ScrollTrigger } from './lib/scroll'

/**
 * TeamKids V2 — "The Map of Hunger".
 * A single interactive WebGL globe anchors the whole experience: drag to spin
 * it, and as you scroll the planet rotates region to region, lighting hunger
 * hotspots and drawing arcs of aid — then asks you to light one yourself.
 */
export default function App() {
  const [ready, setReady] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)

  const openDonate = useCallback((amt?: number) => {
    setAmount(amt ?? null)
    setDonateOpen(true)
  }, [])

  const onPreloadDone = useCallback(() => setReady(true), [])

  useEffect(() => {
    if (!ready) return
    const cleanup = initSmoothScroll()
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('load', onLoad)
      cleanup()
    }
  }, [ready])

  return (
    <>
      <Preloader onDone={onPreloadDone} />
      <Cursor />
      <ScrollProgress />
      <Nav onDonate={() => openDonate()} />
      <main id="main">
        <GlobeStage started={ready} onDonate={() => openDonate()} />
        <Voices />
        <Give onDonate={openDonate} />
      </main>
      <Footer onDonate={() => openDonate()} />
      <DonateModal open={donateOpen} amount={amount} onClose={() => setDonateOpen(false)} />
    </>
  )
}
