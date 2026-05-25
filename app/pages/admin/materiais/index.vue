<script setup lang="ts">
interface MaterialAdminRow {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  _count?: { products: number }
}

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Materiais — Admin Edificio 118' })
const errorMessage = ref('')
const materialToDelete = ref<MaterialAdminRow | null>(null)
const { data: materials, refresh, pending } = await useFetch<MaterialAdminRow[]>('/api/admin/materials', { default: () => [] })
function requestRemove(material: MaterialAdminRow) { materialToDelete.value = material }
async function confirmRemove() {
  if (!materialToDelete.value) return
  errorMessage.value = ''
  try { await $fetch(`/api/admin/materials/${materialToDelete.value.id}`, { method: 'DELETE' }); materialToDelete.value = null; await refresh() } catch (error) { errorMessage.value = toErrorMessage(error) }
}
</script>

<template>
  <AdminShell title="Materiais" eyebrow="Base das peças" description="Lista limpa. Criação e edição ficam em páginas separadas.">
    <template #actions><NuxtLink class="e-admin-button" to="/admin/materiais/novo">Novo material</NuxtLink></template>
    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>
    <section class="e-admin-card p-5"><div v-if="pending" class="grid gap-3"><div v-for="item in 4" :key="item" class="e-admin-skeleton h-20" /></div><div v-else-if="materials.length" class="grid gap-3"><article v-for="material in materials" :key="material.id" class="e-admin-list-card e-admin-index-card e-clickable-row" role="button" tabindex="0" @click="navigateTo(`/admin/materiais/${material.id}`)" @keydown.enter="navigateTo(`/admin/materiais/${material.id}`)"><div><strong>{{ material.name }}</strong><p v-if="material.description">{{ material.description }}</p></div><div class="e-admin-list-meta"><span>{{ material._count?.products || 0 }} produto(s)</span><span class="e-admin-badge" :class="material.isActive ? 'good' : 'muted'">{{ material.isActive ? 'Ativo' : 'Inativo' }}</span></div><div class="e-admin-index-actions" @click.stop><AdminActionsMenu><NuxtLink :to="`/admin/materiais/${material.id}`">Editar</NuxtLink><button type="button" class="danger" @click="requestRemove(material)">Excluir</button></AdminActionsMenu></div></article></div><div v-else class="e-admin-empty">Nenhum material cadastrado ainda.</div></section>

    <AdminConfirmModal
      :open="Boolean(materialToDelete)"
      eyebrow="Excluir material"
      title="Excluir este material?"
      :message="materialToDelete ? `O material ${materialToDelete.name} será removido se não estiver em uso.` : ''"
      confirm-label="Excluir material"
      tone="danger"
      @update:open="(value) => { if (!value) materialToDelete = null }"
      @confirm="confirmRemove"
    />
  </AdminShell>
</template>
