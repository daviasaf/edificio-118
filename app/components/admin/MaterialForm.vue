<script setup lang="ts">
import { z } from 'zod'
import { toErrorMessage } from '~/utils/error'
import { validateAdminForm } from '~/utils/adminValidation'
const materialClientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do material.'),
  description: z.string().trim().optional(),
  isActive: z.boolean()
})

interface MaterialRow {
  id?: string
  name: string
  description?: string | null
  isActive: boolean
}

const props = defineProps<{ material?: MaterialRow | null }>()
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({ name: '', description: '', isActive: true })

function hydrate(material?: MaterialRow | null) {
  form.name = material?.name || ''
  form.description = material?.description || ''
  form.isActive = material?.isActive ?? true
}

hydrate(props.material)
watch(() => props.material, hydrate)

async function save() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const body = { ...form }
  const validation = validateAdminForm(materialClientSchema, body)
  if (!validation.success) {
    errorMessage.value = validation.message
    saving.value = false
    return
  }

  try {
    if (props.material?.id) {
      await $fetch(`/api/admin/materials/${props.material.id}`, { method: 'PUT', body })
      successMessage.value = 'Material atualizado.'
      await navigateTo('/admin/materiais')
    } else {
      await $fetch<MaterialRow>('/api/admin/materials', { method: 'POST', body })
      successMessage.value = 'Material criado.'
      await navigateTo('/admin/materiais')
    }
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="grid gap-5" @submit.prevent="save">
    <p v-if="errorMessage" class="e-admin-alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="e-admin-success">{{ successMessage }}</p>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div><p class="e-admin-eyebrow">Base da peça</p><h2>{{ material?.id ? 'Editar material' : 'Novo material' }}</h2></div>
      </div>
      <div class="e-admin-form-grid">
        <div>
          <label class="e-admin-label" for="material-name">Nome</label>
          <input id="material-name" v-model="form.name" class="e-admin-input" required>
        </div>
        <div>
          <label class="e-admin-label" for="material-description">Descrição</label>
          <textarea id="material-description" v-model="form.description" class="e-admin-textarea min-h-28" />
        </div>
        <label class="e-admin-check"><input v-model="form.isActive" type="checkbox"> Material ativo</label>
      </div>
    </section>

    <div class="e-admin-actions-row">
      <NuxtLink to="/admin/materiais" class="e-admin-button secondary">Cancelar</NuxtLink>
      <button class="e-admin-button" type="submit" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar material' }}</button>
    </div>
  </form>
</template>
