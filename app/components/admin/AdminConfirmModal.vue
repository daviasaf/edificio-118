<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  message?: string
  eyebrow?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
}>(), {
  message: '',
  eyebrow: 'Confirmação',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  tone: 'default'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

function close() {
  emit('update:open', false)
  emit('cancel')
}

function confirmAction() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="e-admin-modal-backdrop" @click.self="close">
      <section class="e-admin-modal-card" role="dialog" aria-modal="true" :aria-label="props.title">
        <p class="e-admin-eyebrow">{{ props.eyebrow }}</p>
        <h2>{{ props.title }}</h2>
        <p v-if="props.message">{{ props.message }}</p>
        <div class="e-admin-actions-row mt-4">
          <button class="e-admin-button secondary" type="button" @click="close">{{ props.cancelLabel }}</button>
          <button class="e-admin-button" :class="{ danger: props.tone === 'danger' }" type="button" @click="confirmAction">{{ props.confirmLabel }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
