import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap, ScrollTrigger, scrollTo, prefersReducedMotion } from '../lib/scroll'
import styles from './GlobeStage.module.css'

const DEG = Math.PI / 180
const HUB = { lat: 41, lon: 12 } // Mediterranean dispatch hub

type Region = { name: string; area: string; lat: number; lon: number; stat: string; statText: string; body: string }

const REGIONS: Region[] = [
  { name: 'The Sahel', area: 'West & Central Africa', lat: 15, lon: 4, stat: '50M', statText: 'people face acute hunger across the Sahel', body: 'Drought layered on conflict has pushed millions of families past the edge. For a child here, a single box is the difference between school and starvation.' },
  { name: 'Horn of Africa', area: 'Ethiopia · Somalia · Kenya', lat: 6, lon: 44, stat: '23M', statText: 'face crisis-level hunger after failed rains', body: 'Five rainy seasons failed in a row. Herders lost everything. Aid that reaches the last village turns a death sentence back into a childhood.' },
  { name: 'Yemen', area: 'Arabian Peninsula', lat: 15.5, lon: 48, stat: '17M', statText: 'don’t know where their next meal comes from', body: 'Years of war have collapsed the food supply. Half the country’s children under five are at risk — and every delivery is fought for.' },
  { name: 'Afghanistan', area: 'South-Central Asia', lat: 34, lon: 66, stat: '15M', statText: 'children and families face severe food insecurity', body: 'Through brutal winters and economic collapse, families ration what little they have. A warm box of food is a small, stubborn act of hope.' },
]

export default function GlobeStage({ started, onDonate }: { started: boolean; onDonate: () => void }) {
  const stage = useRef<HTMLElement>(null)
  const mount = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const heroCard = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!started) return
    const el = mount.current
    if (!el) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      return
    }
    const reduced = prefersReducedMotion()
    const mobile = window.matchMedia('(max-width: 820px)').matches

    const size = () => ({ w: el.clientWidth, h: el.clientHeight })
    let { w, h } = size()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100)
    camera.position.set(0, 0, 13)
    camera.lookAt(0, 0, 0)

    const R = 2.5
    const world = new THREE.Group() // everything that spins
    // sit the globe right of the text on desktop, behind/centred on mobile
    world.position.x = mobile ? 0 : 3.2
    world.position.y = mobile ? 0.3 : 0
    scene.add(world)

    const latLon = (lat: number, lon: number, r = R) => {
      const la = lat * DEG, lo = lon * DEG
      return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo))
    }

    // ---- opaque inner sphere: gives the globe body + occludes far-side dots ----
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.985, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x14111d }),
    )
    world.add(inner)

    // ---- atmosphere glow (fresnel, additive) ----
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.18, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(0xf2922e) } },
        vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vP; uniform vec3 uColor; void main(){ float i=pow(1.0-abs(dot(vN,normalize(-vP))),3.2); gl_FragColor=vec4(uColor, i*0.5); }`,
      }),
    )
    world.add(atmo)

    // ---- dot sprite ----
    const dotTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64
      const x = c.getContext('2d')!
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,200,140,0.9)'); g.addColorStop(1, 'rgba(255,180,110,0)')
      x.fillStyle = g; x.beginPath(); x.arc(32, 32, 32, 0, 7); x.fill()
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
    })()

    let dots: THREE.Points | null = null
    const hotspots: THREE.Sprite[] = []
    const arcs: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; head: THREE.Sprite; frac: number; target: number; count: number }[] = []

    // ---- build dots from the land mask, then hotspots + arcs ----
    new THREE.TextureLoader().load('/assets/earth-mask.png', (tex) => {
      const img = tex.image as HTMLImageElement
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height
      const ctx = cv.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data
      const isLand = (lat: number, lon: number) => {
        const u = (lon + 180) / 360, v = (90 - lat) / 180
        const px = Math.min(cv.width - 1, Math.max(0, Math.floor(u * cv.width)))
        const py = Math.min(cv.height - 1, Math.max(0, Math.floor(v * cv.height)))
        return data[(py * cv.width + px) * 4] > 110
      }
      const N = mobile ? 6500 : 13000
      const golden = Math.PI * (3 - Math.sqrt(5))
      const verts: number[] = []
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2
        const rad = Math.sqrt(1 - y * y)
        const th = golden * i
        const x = Math.cos(th) * rad, z = Math.sin(th) * rad
        const lat = Math.asin(y) / DEG
        const lon = Math.atan2(x, z) / DEG
        if (Math.abs(lat) > 81) continue
        if (isLand(lat, lon)) verts.push(x * R, y * R, z * R)
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      dots = new THREE.Points(geo, new THREE.PointsMaterial({
        size: R * 0.05, map: dotTex, transparent: true, depthWrite: false,
        color: 0xffc488, blending: THREE.AdditiveBlending, sizeAttenuation: true, opacity: 1,
      }))
      world.add(dots)

      // hotspots
      const hotTex = dotTex
      REGIONS.forEach((rg) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: hotTex, color: 0xff5a3c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
        s.position.copy(latLon(rg.lat, rg.lon, R * 1.01))
        s.scale.setScalar(R * 0.16)
        world.add(s); hotspots.push(s)
      })

      // arcs hub -> region
      const hub = latLon(HUB.lat, HUB.lon).normalize()
      REGIONS.forEach((rg) => {
        const a = hub.clone()
        const b = latLon(rg.lat, rg.lon).normalize()
        const omega = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1))
        const so = Math.sin(omega)
        const pts: THREE.Vector3[] = []
        const SEG = 70
        for (let i = 0; i <= SEG; i++) {
          const t = i / SEG
          let p: THREE.Vector3
          if (so < 1e-4) p = a.clone()
          else p = a.clone().multiplyScalar(Math.sin((1 - t) * omega) / so).add(b.clone().multiplyScalar(Math.sin(t * omega) / so))
          p.normalize().multiplyScalar(R * (1 + 0.32 * Math.sin(t * Math.PI)))
          pts.push(p)
        }
        const curve = new THREE.CatmullRomCurve3(pts)
        const tube = new THREE.TubeGeometry(curve, 70, R * 0.012, 8, false)
        const mesh = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }))
        const count = tube.index ? tube.index.count : 0
        tube.setDrawRange(0, 0)
        world.add(mesh)
        const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xfff0d0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
        head.scale.setScalar(0.0); world.add(head)
        arcs.push({ mesh, curve, head, frac: 0, target: 0, count })
      })

      if (reduced) renderOnce()
    })

    // ---- view state driven by scroll + drag ----
    const view = { rotY: -0.35, rotX: 0.18, tRotY: -0.35, tRotX: 0.18, autoRot: true, active: -1, hope: false }

    const faceRegion = (i: number) => {
      const rg = REGIONS[i]
      view.tRotY = -rg.lon * DEG
      view.tRotX = THREE.MathUtils.clamp(rg.lat * DEG, -1.1, 1.1)
      view.autoRot = false
      view.active = i
      view.hope = false
    }
    const overview = () => { view.autoRot = true; view.active = -1; view.hope = false }
    const hopeView = () => { view.autoRot = true; view.active = -1; view.hope = true; view.tRotX = 0.25 }

    function renderOnce() { renderer.render(scene, camera) }

    // drag to spin + click a hotspot to focus its region
    let dragging = false, px = 0, py = 0, moved = 0
    const dom = renderer.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const down = (e: PointerEvent) => { dragging = true; px = e.clientX; py = e.clientY; moved = 0; view.autoRot = false; dom.setPointerCapture(e.pointerId) }
    const moveD = (e: PointerEvent) => {
      if (!dragging) return
      moved += Math.abs(e.clientX - px) + Math.abs(e.clientY - py)
      view.tRotY += (e.clientX - px) * 0.006
      view.tRotX = THREE.MathUtils.clamp(view.tRotX + (e.clientY - py) * 0.006, -1.1, 1.1)
      px = e.clientX; py = e.clientY
    }
    const up = (e: PointerEvent) => {
      dragging = false
      if (moved > 6 || !hotspots.length) return
      const r = dom.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects([...hotspots, inner])[0]
      const idx = hit && hotspots.indexOf(hit.object as THREE.Sprite)
      if (typeof idx === 'number' && idx >= 0) faceRegion(idx)
    }
    if (!reduced) {
      dom.addEventListener('pointerdown', down)
      dom.addEventListener('pointermove', moveD)
      window.addEventListener('pointerup', up)
      dom.style.cursor = 'grab'
    }

    const onResize = () => {
      const s = size(); w = s.w; h = s.h
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
      if (reduced) renderOnce()
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      if (view.autoRot && !dragging) view.tRotY += 0.0016
      view.rotY += (view.tRotY - view.rotY) * 0.06
      view.rotX += (view.tRotX - view.rotX) * 0.06
      world.rotation.y = view.rotY
      world.rotation.x = view.rotX

      hotspots.forEach((s, i) => {
        const on = view.active === i || view.hope
        const base = on ? R * 0.26 : R * 0.14
        s.scale.setScalar(base + Math.sin(t * 3 + i) * (on ? R * 0.08 : R * 0.03))
        ;(s.material as THREE.SpriteMaterial).opacity = on ? 1 : 0.5
      })
      arcs.forEach((arc, i) => {
        arc.target = view.hope ? 1 : view.active === i ? 1 : 0
        arc.frac += (arc.target - arc.frac) * 0.07
        const f = arc.frac < 0.001 ? 0 : arc.frac
        ;(arc.mesh.geometry as THREE.TubeGeometry).setDrawRange(0, Math.floor(arc.count * f))
        if (f > 0.02 && f < 0.995) {
          arc.head.position.copy(arc.curve.getPoint(f)); arc.head.scale.setScalar(R * 0.12)
        } else arc.head.scale.setScalar(0)
      })
      ;(atmo.material as THREE.ShaderMaterial).uniforms.uColor.value.lerp(new THREE.Color(view.hope ? 0xffd9a0 : 0xf2922e), 0.04)

      renderer.render(scene, camera)
    }
    if (!reduced) animate()

    // ---- scrollytelling: each step sets the globe target ----
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`)
      steps.forEach((step, i) => {
        const kind = step.dataset.step // 'hero' | 'region' | 'hope'
        const ri = Number(step.dataset.region)
        ScrollTrigger.create({
          trigger: step, start: 'top center', end: 'bottom center',
          onToggle: (self) => {
            if (!self.isActive) return
            if (kind === 'hero') overview()
            else if (kind === 'hope') hopeView()
            else faceRegion(ri)
          },
        })
        if (!reduced && kind !== 'hero') {
          gsap.fromTo(step.querySelector(`.${styles.card}`), { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 70%', end: 'bottom 40%', toggleActions: 'play reverse play reverse' },
          })
        }
        void i
      })
      // hide the drag hint after the first interaction / scroll
      if (hint.current && !reduced) {
        gsap.to(hint.current, { opacity: 0, duration: 0.5, scrollTrigger: { trigger: stage.current, start: 'top top+=60', toggleActions: 'play none none reverse' } })
      }
    }, stage)

    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
      window.removeEventListener('resize', onResize)
      dom.removeEventListener('pointerdown', down)
      dom.removeEventListener('pointermove', moveD)
      window.removeEventListener('pointerup', up)
      renderer.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
      })
      if (dom.parentNode) dom.parentNode.removeChild(dom)
    }
  }, [started])

  // ---- kinetic hero entrance: headline lines wipe up, copy cascades in, the
  // 733M stat counts up. Plays as the preloader lifts. CSS holds the final
  // state for reduced-motion users, so we just bail here. ----
  useEffect(() => {
    if (!started) return
    const card = heroCard.current
    if (!card || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const lines = card.querySelectorAll(`.${styles.lineInner}`)
      const fades = card.querySelectorAll(`.${styles.fadeUp}`)
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power4.out' } })
      // animate plain `y`: the CSS `translateY(110%)` initial state resolves to a
      // px matrix gsap reads back correctly as y — `yPercent` can't survive that.
      tl.to(lines, { y: 0, duration: 1.0, stagger: 0.12 }, 0)
        .to(fades, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.25)

      const cnt = countRef.current
      if (cnt) {
        cnt.textContent = '0'
        const n = { v: 0 }
        tl.to(n, {
          v: 733, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { cnt.textContent = Math.round(n.v).toString() },
        }, 0.3)
      }
    }, card)
    return () => ctx.revert()
  }, [started])

  return (
    <section className={styles.stage} id="map" ref={stage} aria-label="The map of hunger">
      <div className={styles.sticky}>
        <div className={styles.canvas} ref={mount} />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.hint} ref={hint}>drag to spin · scroll to travel</div>
      </div>

      <div className={styles.steps}>
        <div className={`${styles.step} ${styles.hero}`} data-step="hero" id="top">
          <div className={styles.card} ref={heroCard}>
            <p className={`eyebrow ${styles.fadeUp}`}>TeamKids · The map of hunger</p>
            <h1 className={styles.h1}>
              <span className={styles.line}><span className={styles.lineInner}>Hunger has</span></span>
              <span className={styles.line}><span className={styles.lineInner}>a map.</span></span>
              <span className={styles.line}><span className={`${styles.lineInner} ${styles.shimmer}`}>So does hope.</span></span>
            </h1>
            <p className={`${styles.lead} ${styles.fadeUp}`}>
              Right now, <span className={styles.count} ref={countRef}>733</span> million people don’t know where their
              next meal comes from. Spin the planet. Find them. Then help us light their corner of it.
            </p>
            <div className={`${styles.actions} ${styles.fadeUp}`}>
              <button className="btn btn--primary" data-magnetic onClick={() => onDonate()}>Light a region</button>
              <a className="btn btn--ghost" data-magnetic href="#give" onClick={(e) => { e.preventDefault(); scrollTo('#give') }}>How it works</a>
            </div>
          </div>
        </div>

        {REGIONS.map((rg, i) => (
          <div className={styles.step} data-step="region" data-region={i} key={rg.name}>
            <div className={styles.card}>
              <span className={styles.pin}>◍ {rg.area}</span>
              <h2 className={styles.region}>{rg.name}</h2>
              <div className={styles.bigstat}><strong>{rg.stat}</strong> {rg.statText}</div>
              <p className={styles.body}>{rg.body}</p>
            </div>
          </div>
        ))}

        <div className={`${styles.step} ${styles.hopeStep}`} data-step="hope">
          <div className={styles.card}>
            <p className="eyebrow">Every arc starts with one gift</p>
            <h2 className={styles.region}>We can light <span className="text-amber">the whole map</span>.</h2>
            <p className={styles.body}>
              Each glowing line is food moving toward a child who is waiting. Add yours —
              and watch one more corner of the world come back to light.
            </p>
            <div className={styles.actions}>
              <button className="btn btn--primary" data-magnetic onClick={() => onDonate()}>Send a box tonight</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
