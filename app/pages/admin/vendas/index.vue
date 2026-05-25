<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import SaleForm from '~/components/admin/SaleForm.vue'
import type { ManualSaleDTO } from '~~/shared/types/sale'
import type { AdminProduct } from '~~/shared/types/product'

useHead({ bodyAttrs: { class: 'e-admin-body' } })

const route = useRoute()
const isCreateRoute = computed(() => ['nova', 'novo'].includes(String(route.path.split('/').filter(Boolean).at(-1) || '')))
useSeoMeta({ title: () => isCreateRoute.value ? 'Registrar venda — Admin Edificio 118' : 'Vendas — Admin Edificio 118' })

const dateFrom = ref('')
const dateTo = ref('')
const productFilter = ref('')
const channelFilter = ref('')
const errorMessage = ref('')
const saleToDelete = ref<ManualSaleDTO | null>(null)

const channels = ['WhatsApp', 'Instagram', 'Presencial', 'Outro']
const { data: products } = await useFetch<AdminProduct[]>('/api/admin/products', { default: () => [] })
const { data: sales, pending, refresh } = await useFetch<ManualSaleDTO[]>('/api/admin/sales', {
  query: computed(() => ({
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
    productId: productFilter.value || undefined,
    channel: channelFilter.value || undefined
  })),
  default: () => []
})

const totalRevenue = computed(() => sales.value.reduce((sum, sale) => sum + sale.totalRevenue, 0))
const totalQuantity = computed(() => sales.value.reduce((sum, sale) => sum + sale.quantity, 0))
const averageTicket = computed(() => sales.value.length ? totalRevenue.value / sales.value.length : 0)

function brl(value?: number | null) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function requestRemove(sale: ManualSaleDTO) {
  saleToDelete.value = sale
}

async function confirmRemove() {
  if (!saleToDelete.value) return
  try {
    await $fetch(`/api/admin/sales/${saleToDelete.value.id}`, { method: 'DELETE' })
    saleToDelete.value = null
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}
</script>

<template>
  <AdminShell
    v-if="isCreateRoute"
    title="Registrar venda"
    eyebrow="Controle manual"
    description="Lance uma venda feita pelo WhatsApp, Instagram, presencial ou outro canal."
  >
    <AdminBackLink to="/admin/vendas" label="Voltar para vendas" />
    <ClientOnly>
      <SaleForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>

  <AdminShell
    v-else
    title="Vendas"
    eyebrow="Controle manual"
    description="Lista de vendas lançadas. Criação e edição ficam em páginas separadas."
  >
    <template #actions>
      <NuxtLink class="e-admin-button" to="/admin/vendas/nova">Registrar venda</NuxtLink>
    </template>

    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>

    <div class="grid gap-4 md:grid-cols-3">
      <AdminStatCard label="Total vendido" :value="brl(totalRevenue)" tone="acid" />
      <AdminStatCard label="Quantidade" :value="totalQuantity" hint="Peças vendidas" />
      <AdminStatCard label="Ticket médio" :value="brl(averageTicket)" />
    </div>

    <section class="e-admin-card p-5 mt-5">
      <div class="e-admin-filters mb-4">
        <input v-model="dateFrom" class="e-admin-input" type="date">
        <input v-model="dateTo" class="e-admin-input" type="date">
        <select v-model="productFilter" class="e-admin-select">
          <option value="">Todos os produtos</option>
          <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
        </select>
        <select v-model="channelFilter" class="e-admin-select">
          <option value="">Todos os canais</option>
          <option v-for="channel in channels" :key="channel" :value="channel">{{ channel }}</option>
        </select>
      </div>

      <div v-if="pending" class="e-admin-skeleton h-64" />
      <div v-else-if="sales.length" class="grid gap-3">
        <article
          v-for="sale in sales"
          :key="sale.id"
          class="e-admin-list-card e-admin-index-card e-clickable-row"
          role="button"
          tabindex="0"
          @click="navigateTo(`/admin/vendas/${sale.id}`)"
          @keydown.enter="navigateTo(`/admin/vendas/${sale.id}`)"
        >
          <div>
            <strong>{{ sale.productNameSnapshot }}</strong>
            <small>{{ new Date(sale.soldAt).toLocaleDateString('pt-BR') }} · {{ sale.channel }}</small>
          </div>
          <div class="e-admin-list-meta">
            <span>{{ sale.quantity }} un.</span>
            <span>{{ brl(sale.totalRevenue) }}</span>
            <span>Lucro {{ brl(sale.estimatedProfit) }}</span>
          </div>
          <div class="e-admin-index-actions" @click.stop>
            <AdminActionsMenu>
              <NuxtLink :to="`/admin/vendas/${sale.id}`">Editar</NuxtLink>
              <button type="button" class="danger" @click="requestRemove(sale)">Excluir</button>
            </AdminActionsMenu>
          </div>
        </article>
      </div>
      <div v-else class="e-admin-empty">Ainda não tem venda lançada nesse período.</div>
    </section>

    <AdminConfirmModal
      :open="Boolean(saleToDelete)"
      eyebrow="Excluir venda"
      title="Excluir esta venda?"
      :message="saleToDelete ? `A venda de ${saleToDelete.productNameSnapshot} será removida dos relatórios.` : ''"
      confirm-label="Excluir venda"
      tone="danger"
      @update:open="(value) => { if (!value) saleToDelete = null }"
      @confirm="confirmRemove"
    />
  </AdminShell>
</template>
