<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import CategoryForm from '~/components/admin/CategoryForm.vue'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Nova categoria — Admin Edificio 118' })
</script>

<template>
  <AdminShell title="Nova categoria" eyebrow="Criação" description="Crie um grupo para organizar as peças no catálogo.">
    <AdminBackLink to="/admin/categorias" label="Voltar para categorias" />
    <ClientOnly>
      <CategoryForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>
</template>
