<script setup lang="ts">
import { emitAdminToast } from '~/utils/adminValidation'
const props = withDefaults(defineProps<{
  endpoint: string
  modelValue: string[]
  max?: number
  label?: string
}>(), {
  max: 8,
  label: 'Adicionar imagens'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  error: [message: string]
  success: [message: string]
}>()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const images = computed(() => props.modelValue || [])
const canUpload = computed(() => images.value.length < props.max && !uploading.value)

async function upload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (!files.length) return

  uploading.value = true
  const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  const maxSize = 5 * 1024 * 1024
  const uploaded: string[] = []
  const failed: string[] = []

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      failed.push(`${file.name}: tipo inválido`)
      continue
    }

    if (file.size > maxSize) {
      failed.push(`${file.name}: maior que 5MB`)
      continue
    }

    if (images.value.length + uploaded.length >= props.max) {
      failed.push(`${file.name}: limite de ${props.max} imagens atingido`)
      continue
    }

    const body = new FormData()
    body.append('images', file)

    try {
      const response = await $fetch<{ images: string[] }>(props.endpoint, { method: 'POST', body })
      uploaded.push(...response.images)
    } catch (error) {
      failed.push(`${file.name}: ${toErrorMessage(error, 'falhou ao enviar')}`)
    }
  }

  if (uploaded.length) {
    emit('update:modelValue', Array.from(new Set([...images.value, ...uploaded])).slice(0, props.max))
    emit('success', uploaded.length === 1 ? 'Imagem enviada automaticamente.' : `${uploaded.length} imagens enviadas automaticamente.`)
  }

  if (failed.length) {
    const message = `Algumas imagens não subiram: ${failed.join(' | ')}`
    emit('error', message)
    emitAdminToast(message, 'error')
  }

  target.value = ''
  uploading.value = false
}

function makeFirst(image: string) {
  emit('update:modelValue', [image, ...images.value.filter((item) => item !== image)])
}

function removeImage(image: string) {
  emit('update:modelValue', images.value.filter((item) => item !== image))
}
</script>

<template>
  <div class="e-admin-uploader">
    <input ref="input" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple :disabled="!canUpload" @change="upload">
    <button class="e-admin-upload-button" type="button" :disabled="!canUpload" @click="input?.click()">
      <span>{{ uploading ? 'Enviando...' : label }}</span>
      <small>{{ images.length }}/{{ max }}</small>
    </button>
    <p class="e-admin-help">JPG, PNG ou WEBP. Ao escolher o arquivo, o upload começa sozinho.</p>

    <div v-if="images.length" class="e-admin-image-grid mt-4">
      <div v-for="image in images" :key="image" class="e-admin-image-card active">
        <img :src="image" :alt="image">
        <div class="e-admin-image-actions">
          <AdminActionsMenu>
            <button type="button" @click="makeFirst(image)">Mover para frente</button>
            <button type="button" class="danger" @click="removeImage(image)">Remover imagem</button>
          </AdminActionsMenu>
        </div>
      </div>
    </div>
  </div>
</template>
