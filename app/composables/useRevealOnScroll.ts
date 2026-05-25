export function useRevealOnScroll() {
  const revealObserver = shallowRef<IntersectionObserver | null>(null)
  const mutationObserver = shallowRef<MutationObserver | null>(null)
  const observedNodes = new WeakSet<HTMLElement>()

  function observeNode(node: HTMLElement) {
    if (observedNodes.has(node)) return
    observedNodes.add(node)

    if (!revealObserver.value) {
      node.classList.add('is-visible')
      return
    }

    revealObserver.value.observe(node)
  }

  function bind() {
    if (!import.meta.client) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (prefersReduced || !('IntersectionObserver' in window)) {
      for (const node of revealNodes) node.classList.add('is-visible')
      return
    }

    revealObserver.value?.disconnect()
    revealObserver.value = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.value?.unobserve(entry.target)
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' })

    for (const node of revealNodes) observeNode(node)

    mutationObserver.value?.disconnect()
    mutationObserver.value = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const added of Array.from(mutation.addedNodes)) {
          if (!(added instanceof HTMLElement)) continue
          if (added.matches('[data-reveal]')) observeNode(added)
          for (const node of Array.from(added.querySelectorAll<HTMLElement>('[data-reveal]'))) observeNode(node)
        }
      }
    })

    mutationObserver.value.observe(document.body, { childList: true, subtree: true })
  }

  function destroy() {
    revealObserver.value?.disconnect()
    revealObserver.value = null
    mutationObserver.value?.disconnect()
    mutationObserver.value = null
  }

  onMounted(bind)
  onBeforeUnmount(destroy)

  return { bind, destroy }
}
