<script setup lang="ts">
const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const position = reactive({ top: 0, right: 0 })

function close() {
  open.value = false
}

function toggle(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  position.top = Math.round(rect.bottom + 8)
  position.right = Math.max(12, Math.round(window.innerWidth - rect.right))
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) return
  const target = event.target as Node
  if (menuRef.value?.contains(target)) return
  close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', close)
  window.addEventListener('scroll', close, true)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', close)
  window.removeEventListener('scroll', close, true)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="menuRef" class="e-admin-actions-menu">
    <button class="e-admin-actions-trigger" type="button" aria-label="Abrir acoes" :aria-expanded="open" @click.stop="toggle">...</button>
    <Teleport to="body">
      <div
        v-if="open"
        class="e-admin-actions-dropdown"
        :style="{ top: `${position.top}px`, right: `${position.right}px` }"
        @click="close"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>
