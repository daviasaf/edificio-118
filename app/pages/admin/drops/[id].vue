<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import DropForm from '~/components/admin/DropForm.vue'
import type { AdminDrop } from '~~/shared/types/drop'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Editar drop — Admin Edificio 118' })

const route = useRoute()
const dropId = computed(() => String(route.params.id || ''))
const { data: drop, pending, error } = useFetch<AdminDrop>(() => `/api/admin/drops/${dropId.value}`, { default: () => null as unknown as AdminDrop })
</script>

<template>
  <AdminShell title="Editar drop" eyebrow="Cor pública" :description="drop ? `Ajustando ${drop.title}` : 'Carregando drop...'">
    <AdminBackLink to="/admin/drops" label="Voltar para drops" />
    <div v-if="pending" class="e-admin-skeleton mt-4 h-96" />
    <div v-else-if="error" class="e-admin-empty mt-4">Não consegui carregar esse drop. Tente voltar e abrir de novo.</div>
    <div v-else-if="drop" class="mt-4 grid gap-5">
      <DropForm :drop="drop" />
    </div>
    <div v-else class="e-admin-empty mt-4">Drop não encontrado.</div>
  </AdminShell>
</template>
