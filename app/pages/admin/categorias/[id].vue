<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import CategoryForm from '~/components/admin/CategoryForm.vue'

interface CategoryAdminRow {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  _count?: { products: number }
}

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Editar categoria — Admin Edificio 118' })

const route = useRoute()
const { data: category, pending, error } = useFetch<CategoryAdminRow>(() => `/api/admin/categories/${String(route.params.id)}`)
</script>

<template>
  <AdminShell title="Editar categoria" eyebrow="Catálogo" :description="category ? `Ajustando ${category.name}` : 'Carregando categoria...'">
    <AdminBackLink to="/admin/categorias" label="Voltar para categorias" />
    <div v-if="pending" class="e-admin-skeleton mt-4 h-72" />
    <div v-else-if="error" class="e-admin-empty mt-4">Não consegui carregar essa categoria.</div>
    <CategoryForm v-else-if="category" :category="category" class="mt-4" />
    <div v-else class="e-admin-empty mt-4">Categoria não encontrada.</div>
  </AdminShell>
</template>
