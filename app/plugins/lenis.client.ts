import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'lenis/dist/lenis.css'

declare global {
  interface Window {
    __edificioLenis?: Lenis
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  gsap.registerPlugin(ScrollTrigger)

  window.__edificioLenis?.destroy()

  if (prefersReducedMotion.matches) {
    document.documentElement.classList.add('is-reduced-motion')
    window.__edificioLenis = undefined
    return
  }

  const lenis = new Lenis({
    lerp: 0.058,
    smoothWheel: true,
    wheelMultiplier: 0.42,
    touchMultiplier: 0.95,
    syncTouch: false,
    anchors: { offset: -84, duration: 1.05 },
    overscroll: false,
    autoResize: true,
    prevent: (node) => node instanceof HTMLElement && Boolean(node.closest('[data-lenis-prevent]'))
  })

  window.__edificioLenis = lenis
  lenis.on('scroll', ScrollTrigger.update)

  const ticker = (time: number) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(ticker)
  gsap.ticker.lagSmoothing(0)

  const resize = () => {
    requestAnimationFrame(() => lenis.resize())
  }

  nuxtApp.hook('page:start', () => {
    lenis.stop()
  })

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => {
      lenis.start()
      lenis.resize()
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash)
        if (target instanceof HTMLElement) lenis.scrollTo(target, { offset: -84, immediate: false, duration: 1.05 })
      }
    })
  })

  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('load', resize, { once: true })

  nuxtApp.hook('app:beforeMount', resize)

  window.addEventListener('beforeunload', () => {
    gsap.ticker.remove(ticker)
    lenis.off('scroll', ScrollTrigger.update)
    window.removeEventListener('resize', resize)
    lenis.destroy()
    if (window.__edificioLenis === lenis) window.__edificioLenis = undefined
  })

  return {
    provide: { lenis }
  }
})
