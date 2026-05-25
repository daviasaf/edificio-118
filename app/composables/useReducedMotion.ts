export function useReducedMotion() {
  const prefersReducedMotion = ref(false)
  let media: MediaQueryList | null = null

  function update() {
    prefersReducedMotion.value = Boolean(media?.matches)
  }

  onMounted(() => {
    if (!import.meta.client) return
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    media.addEventListener?.('change', update)
  })

  onBeforeUnmount(() => {
    media?.removeEventListener?.('change', update)
  })

  return { prefersReducedMotion }
}
