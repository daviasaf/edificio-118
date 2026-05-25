<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import DropForm from '~/components/admin/DropForm.vue'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Novo drop — Admin Edificio 118' })
</script>

<template>
  <AdminShell title="Novo drop" eyebrow="Criação" description="Crie um lançamento e escolha como ele aparece na home.">
    <AdminBackLink to="/admin/drops" label="Voltar para drops" />
    <ClientOnly>
      <DropForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>
</template>
