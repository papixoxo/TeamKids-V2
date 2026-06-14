import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// Flag that JS is driving — CSS uses `.js [data-reveal]` to hide pre-reveal
// content only when we can actually animate it back in (no-JS still shows).
document.documentElement.classList.add('js')

// NOTE: StrictMode intentionally omitted — its dev double-invoke fights GSAP
// ScrollTrigger pinning, Lenis, and three.js lifecycle setup.
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
