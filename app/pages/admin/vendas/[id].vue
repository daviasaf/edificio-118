<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import SaleForm from '~/components/admin/SaleForm.vue'
import type { ManualSaleDTO } from '~~/shared/types/sale'

useHead({ bodyAttrs: { class: 'e-admin-body' } })

const route = useRoute()
const id = computed(() => String(route.params.id || ''))
const isNewSale = computed(() => id.value === 'nova' || id.value === 'novo')

useSeoMeta({ title: () => isNewSale.value ? 'Registrar venda — Admin Edificio 118' : 'Editar venda — Admin Edificio 118' })

const { data: sale, pending, error } = await useAsyncData<ManualSaleDTO | null>(
  () => `sale-${id.value}`,
  async () => isNewSale.value ? null : await $fetch<ManualSaleDTO>(`/api/admin/sales/${id.value}`),
  { default: () => null }
)
</script>

<template>
  <AdminShell
    :title="isNewSale ? 'Registrar venda' : 'Editar venda'"
    eyebrow="Controle manual"
    :description="isNewSale ? 'Lance uma venda feita pelo WhatsApp, Instagram, presencial ou outro canal.' : sale ? `Venda de ${sale.productNameSnapshot}` : 'Carregando venda...'"
  >
    <AdminBackLink to="/admin/vendas" label="Voltar para vendas" />
    <SaleForm v-if="isNewSale" class="mt-4" />
    <template v-else>
      <div v-if="pending" class="e-admin-skeleton mt-4 h-80" />
      <div v-else-if="error" class="e-admin-empty mt-4">Não consegui carregar essa venda.</div>
      <SaleForm v-else-if="sale" :sale="sale" class="mt-4" />
      <div v-else class="e-admin-empty mt-4">Venda não encontrada.</div>
    </template>
  </AdminShell>
</template>
