<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import ProductForm from '~/components/admin/ProductForm.vue'
import type { AdminProduct } from '~~/shared/types/product'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Editar produto — Admin Edificio 118' })

const route = useRoute()
const productId = computed(() => String(route.params.id || ''))
const { data: product, pending, error, refresh } = useFetch<AdminProduct>(() => `/api/admin/products/${productId.value}`)
</script>

<template>
  <AdminShell
    title="Editar produto"
    eyebrow="Catálogo interno"
    :description="product ? `Ajustando ${product.name}` : 'Carregando produto...'"
  >
    <AdminBackLink to="/admin/produtos" label="Voltar para produtos" />

    <div v-if="pending" class="mt-4 grid gap-4">
      <div class="e-admin-skeleton h-28" />
      <div class="e-admin-skeleton h-96" />
    </div>
    <div v-else-if="error" class="e-admin-empty mt-4">Não consegui carregar esse produto.</div>
    <ProductForm v-else-if="product" :product="product" class="mt-4" @saved="refresh" />
    <div v-else class="e-admin-empty mt-4">Produto não encontrado.</div>
  </AdminShell>
</template>
