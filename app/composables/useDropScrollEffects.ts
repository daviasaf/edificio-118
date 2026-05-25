import type { Ref } from 'vue'

type LenisLike = {
  on?: (event: 'scroll', handler: () => void) => void
  off?: (event: 'scroll', handler: () => void) => void
  resize?: () => void
  scrollTo?: (target: HTMLElement | string, options?: Record<string, unknown>) => void
}

function getLenis() {
  return (window as Window & { __edificioLenis?: LenisLike }).__edificioLenis
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

export function useDropScrollEffects(sectionRef: Ref<HTMLElement | null>) {
  const progress = ref(0)
  const velocity = ref(0)
  const { prefersReducedMotion } = useReducedMotion()
  let lastScroll = 0
  let raf = 0
  let smoothProgress = 0
  let targetProgress = 0

  function lerp(current: number, target: number, factor: number) {
    return current + (target - current) * factor
  }

  function calculate() {
    const element = sectionRef.value
    if (!element || !import.meta.client) return

    const rect = element.getBoundingClientRect()
    const viewport = window.innerHeight || 1
    const total = Math.max(rect.height + viewport, 1)
    const current = viewport - rect.top
    targetProgress = clamp(current / total)
    smoothProgress = lerp(smoothProgress, targetProgress, 0.2)
    const nextProgress = Math.abs(smoothProgress - targetProgress) < 0.001 ? targetProgress : smoothProgress
    const scrollY = window.scrollY || window.pageYOffset || 0

    velocity.value = scrollY - lastScroll
    progress.value = nextProgress
    lastScroll = scrollY

    element.style.setProperty('--drop-progress', nextProgress.toFixed(4))
    element.style.setProperty('--drop-velocity', clamp(Math.abs(velocity.value) / 64, 0, 1).toFixed(4))
    element.style.setProperty('--drop-shift', `${((nextProgress - 0.5) * -42).toFixed(2)}px`)
    element.style.setProperty('--drop-shift-soft', `${((nextProgress - 0.5) * -24).toFixed(2)}px`)
    element.style.setProperty('--drop-shift-wall', `${((nextProgress - 0.5) * 18).toFixed(2)}px`)
    element.style.setProperty('--drop-rotate', `${((nextProgress - 0.5) * 4).toFixed(2)}deg`)
    element.style.setProperty('--drop-zoom-soft', (1 + nextProgress * 0.04).toFixed(4))
    element.style.setProperty('--drop-zoom-impact', (1 + nextProgress * 0.18).toFixed(4))
    element.style.setProperty('--drop-zoom-archive', (1.02 + nextProgress * 0.08).toFixed(4))
    element.style.setProperty('--drop-speed-zoom', (1.02 + clamp(Math.abs(velocity.value) / 64, 0, 1) * 0.03).toFixed(4))
  }

  function requestCalculate() {
    if (prefersReducedMotion.value) return
    cancelAnimationFrame(raf)
    const tick = () => {
      calculate()
      if (Math.abs(smoothProgress - targetProgress) > 0.001) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  function resizeLenis() {
    if (!import.meta.client) return
    getLenis()?.resize?.()
  }

  function scrollTo(target: Element | string) {
    if (!import.meta.client) return
    if (prefersReducedMotion.value) {
      const element = typeof target === 'string' ? document.querySelector(target) : target
      element?.scrollIntoView({ behavior: 'auto', block: 'start' })
      return
    }

    if (getLenis()?.scrollTo) {
      const element = typeof target === 'string' ? target : target instanceof HTMLElement ? target : null
      if (element) getLenis()?.scrollTo?.(element, { offset: -84, duration: 1.15, immediate: false })
      return
    }

    const element = typeof target === 'string' ? document.querySelector(target) : target
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  onMounted(() => {
    if (!import.meta.client) return
    lastScroll = window.scrollY || window.pageYOffset || 0
    calculate()
    window.addEventListener('scroll', requestCalculate, { passive: true })
    window.addEventListener('resize', resizeLenis)
    getLenis()?.on?.('scroll', requestCalculate)
    requestAnimationFrame(resizeLenis)
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', requestCalculate)
    window.removeEventListener('resize', resizeLenis)
    getLenis()?.off?.('scroll', requestCalculate)
  })

  return { progress, velocity, prefersReducedMotion, scrollTo, resizeLenis }
}
