<script setup lang="ts">
import type { PublicDrop } from '~~/shared/types/drop'

const route = useRoute()

type ToastKind = 'error' | 'success' | 'info'
interface GlobalToast {
  id: number
  message: string
  type: ToastKind
}

const toasts = ref<GlobalToast[]>([])
let toastId = 0

function pushToast(message: string, type: ToastKind = 'error') {
  if (!message) return
  const id = ++toastId
  toasts.value.push({ id, message, type })
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, 4600)
}

function safeAccent(value?: string | null) {
  const color = (value || '#D6FF2F').trim()
  const isHex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
  const isRgb = /^rgb\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/.test(color)
  return isHex || isRgb ? color : '#D6FF2F'
}

const { data: publicAccentDrop, refresh: refreshPublicAccent } = await useFetch<PublicDrop | null>('/api/shop/drops/featured', {
  key: 'edificio-public-active-drop-accent',
  default: () => null
})

const activeAccent = computed(() => route.path.startsWith('/admin') ? '#D6FF2F' : safeAccent(publicAccentDrop.value?.highlightColor))

useHead(() => ({
  bodyAttrs: { class: 'edificio-body' },
  style: [{ key: 'edificio-user-accent', children: `:root{--e-acid:${activeAccent.value};--drop-accent:${activeAccent.value};}` }]
}))

watchEffect(() => {
  if (import.meta.client) {
    document.documentElement.style.setProperty('--e-acid', activeAccent.value)
    document.documentElement.style.setProperty('--drop-accent', activeAccent.value)
  }
})

onMounted(() => {
  window.addEventListener('edificio-admin-toast', ((event: Event) => {
    const detail = (event as CustomEvent<{ message?: string; type?: ToastKind }>).detail
    pushToast(detail?.message || 'Revise os campos do formulário.', detail?.type || 'error')
  }) as EventListener)
})

watch(() => route.fullPath, () => {
  if (!route.path.startsWith('/admin')) refreshPublicAccent()
})

useRevealOnScroll()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <div v-if="toasts.length" class="e-global-toast-stack" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" :class="['e-global-toast', toast.type]">{{ toast.message }}</div>
    </div>
  </NuxtLayout>
</template>
