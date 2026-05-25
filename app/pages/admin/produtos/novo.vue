<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import ProductForm from '~/components/admin/ProductForm.vue'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Novo produto — Admin Edificio 118' })
</script>

<template>
  <AdminShell
    title="Novo produto"
    eyebrow="Cadastro de peça"
    description="Publique roupas com imagens, variações, custo e status controlados."
  >
    <AdminBackLink to="/admin/produtos" label="Voltar para produtos" />
    <ClientOnly>
      <ProductForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>
</template>
