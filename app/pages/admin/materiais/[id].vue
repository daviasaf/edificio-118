<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import MaterialForm from '~/components/admin/MaterialForm.vue'

interface MaterialAdminRow {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  _count?: { products: number }
}

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Editar material — Admin Edificio 118' })

const route = useRoute()
const { data: material, pending, error } = useFetch<MaterialAdminRow>(() => `/api/admin/materials/${String(route.params.id)}`)
</script>

<template>
  <AdminShell title="Editar material" eyebrow="Base das peças" :description="material ? `Ajustando ${material.name}` : 'Carregando material...'">
    <AdminBackLink to="/admin/materiais" label="Voltar para materiais" />
    <div v-if="pending" class="e-admin-skeleton mt-4 h-72" />
    <div v-else-if="error" class="e-admin-empty mt-4">Não consegui carregar esse material.</div>
    <MaterialForm v-else-if="material" :material="material" class="mt-4" />
    <div v-else class="e-admin-empty mt-4">Material não encontrado.</div>
  </AdminShell>
</template>
