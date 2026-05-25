<script setup lang="ts">
interface CategoryAdminRow {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  _count?: { products: number }
}

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Categorias — Admin Edificio 118' })

const errorMessage = ref('')
const categoryToDelete = ref<CategoryAdminRow | null>(null)
const { data: categories, refresh, pending } = await useFetch<CategoryAdminRow[]>('/api/admin/categories', { default: () => [] })

function requestRemove(category: CategoryAdminRow) { categoryToDelete.value = category }
async function confirmRemove() {
  if (!categoryToDelete.value) return
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/categories/${categoryToDelete.value.id}`, { method: 'DELETE' })
    categoryToDelete.value = null
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}
</script>

<template>
  <AdminShell title="Categorias" eyebrow="Organização do catálogo" description="Lista limpa. Criação e edição ficam em páginas separadas.">
    <template #actions><NuxtLink class="e-admin-button" to="/admin/categorias/novo">Nova categoria</NuxtLink></template>
    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>
    <section class="e-admin-card p-5">
      <div v-if="pending" class="grid gap-3"><div v-for="item in 4" :key="item" class="e-admin-skeleton h-20" /></div>
      <div v-else-if="categories.length" class="grid gap-3">
        <article v-for="category in categories" :key="category.id" class="e-admin-list-card e-admin-index-card e-clickable-row" role="button" tabindex="0" @click="navigateTo(`/admin/categorias/${category.id}`)" @keydown.enter="navigateTo(`/admin/categorias/${category.id}`)">
          <div><strong>{{ category.name }}</strong><small>/{{ category.slug }}</small><p v-if="category.description">{{ category.description }}</p></div>
          <div class="e-admin-list-meta"><span>{{ category._count?.products || 0 }} produto(s)</span><span class="e-admin-badge" :class="category.isActive ? 'good' : 'muted'">{{ category.isActive ? 'Ativa' : 'Inativa' }}</span></div>
          <div class="e-admin-index-actions" @click.stop><AdminActionsMenu><NuxtLink :to="`/admin/categorias/${category.id}`">Editar</NuxtLink><button type="button" class="danger" @click="requestRemove(category)">Excluir</button></AdminActionsMenu></div>
        </article>
      </div>
      <div v-else class="e-admin-empty">Nenhuma categoria cadastrada ainda.</div>
    </section>

    <AdminConfirmModal
      :open="Boolean(categoryToDelete)"
      eyebrow="Excluir categoria"
      title="Excluir esta categoria?"
      :message="categoryToDelete ? `A categoria ${categoryToDelete.name} será removida se não estiver em uso.` : ''"
      confirm-label="Excluir categoria"
      tone="danger"
      @update:open="(value) => { if (!value) categoryToDelete = null }"
      @confirm="confirmRemove"
    />
  </AdminShell>
</template>
