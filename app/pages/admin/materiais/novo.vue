<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import MaterialForm from '~/components/admin/MaterialForm.vue'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Novo material — Admin Edificio 118' })
</script>

<template>
  <AdminShell title="Novo material" eyebrow="Criação" description="Cadastre a base usada nas peças.">
    <AdminBackLink to="/admin/materiais" label="Voltar para materiais" />
    <ClientOnly>
      <MaterialForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>
</template>
