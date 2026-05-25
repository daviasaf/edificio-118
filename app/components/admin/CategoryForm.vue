<script setup lang="ts">
import { z } from 'zod'
import { toErrorMessage } from '~/utils/error'
import { validateAdminForm } from '~/utils/adminValidation'
const categoryClientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da categoria.'),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean()
})

interface CategoryRow {
  id?: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
}

const props = defineProps<{ category?: CategoryRow | null }>()
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({ name: '', slug: '', description: '', isActive: true })

function slugifyInput(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function hydrate(category?: CategoryRow | null) {
  form.name = category?.name || ''
  form.slug = category?.slug || ''
  form.description = category?.description || ''
  form.isActive = category?.isActive ?? true
}

hydrate(props.category)
watch(() => props.category, hydrate)
watch(() => form.name, (name) => {
  if (!props.category?.id && !form.slug) form.slug = slugifyInput(name)
})

async function save() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const body = { ...form }
  const validation = validateAdminForm(categoryClientSchema, body)
  if (!validation.success) {
    errorMessage.value = validation.message
    saving.value = false
    return
  }

  try {
    if (props.category?.id) {
      await $fetch(`/api/admin/categories/${props.category.id}`, { method: 'PUT', body })
      successMessage.value = 'Categoria atualizada.'
      await navigateTo('/admin/categorias')
    } else {
      await $fetch<CategoryRow>('/api/admin/categories', { method: 'POST', body })
      successMessage.value = 'Categoria criada.'
      await navigateTo('/admin/categorias')
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
        <div><p class="e-admin-eyebrow">Catálogo</p><h2>{{ category?.id ? 'Editar categoria' : 'Nova categoria' }}</h2></div>
      </div>
      <div class="e-admin-form-grid">
        <div>
          <label class="e-admin-label" for="category-name">Nome</label>
          <input id="category-name" v-model="form.name" class="e-admin-input" required>
        </div>
        <div>
          <label class="e-admin-label" for="category-slug">Slug</label>
          <input id="category-slug" v-model="form.slug" class="e-admin-input" placeholder="automatico se deixar vazio">
        </div>
        <div>
          <label class="e-admin-label" for="category-description">Descrição</label>
          <textarea id="category-description" v-model="form.description" class="e-admin-textarea min-h-28" />
        </div>
        <label class="e-admin-check"><input v-model="form.isActive" type="checkbox"> Categoria ativa</label>
      </div>
    </section>

    <div class="e-admin-actions-row">
      <NuxtLink to="/admin/categorias" class="e-admin-button secondary">Cancelar</NuxtLink>
      <button class="e-admin-button" type="submit" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar categoria' }}</button>
    </div>
  </form>
</template>
