<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import SaleForm from '~/components/admin/SaleForm.vue'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Registrar venda — Admin Edificio 118' })
</script>

<template>
  <AdminShell title="Registrar venda" eyebrow="Controle manual" description="Lance uma venda feita pelo WhatsApp, Instagram, presencial ou outro canal.">
    <AdminBackLink to="/admin/vendas" label="Voltar para vendas" />
    <ClientOnly>
      <SaleForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>
</template>
