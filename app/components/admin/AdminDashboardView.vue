<script setup lang="ts">
import type { DashboardSummary } from '~~/shared/types/report'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Dashboard — Admin Edificio 118' })

const period = ref('30d')
const customFrom = ref(new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().slice(0, 10))
const customTo = ref(new Date().toISOString().slice(0, 10))

const query = computed(() => ({
  period: period.value,
  dateFrom: period.value === 'custom' ? customFrom.value : undefined,
  dateTo: period.value === 'custom' ? customTo.value : undefined
}))

const { data: summary, pending, refresh } = await useFetch<DashboardSummary>('/api/admin/reports/summary', {
  query,
  default: () => ({
    period: { dateFrom: '', dateTo: '', label: 'Últimos 30 dias' },
    totals: {
      revenue: 0,
      grossProfit: 0,
      expenses: 0,
      netProfit: 0,
      quantitySold: 0,
      ticketAverage: 0,
      lowStockProducts: 0,
      publishedProducts: 0,
      draftProducts: 0
    },
    topProduct: null,
    charts: {
      salesByDate: [],
      profitByDate: [],
      expensesByDate: [],
      topProducts: [],
      salesByCategory: [],
      financeByDate: []
    },
    recentSales: []
  })
})

watch([period, customFrom, customTo], () => refresh())

function brl(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}
</script>

<template>
  <AdminShell
    title="Dashboard"
    eyebrow="Visão geral"
    description="Vendas manuais, despesas, lucro e estoque em uma tela só."
  >
    <template #actions>
      <div class="e-admin-periods">
        <select v-model="period" class="e-admin-select compact">
          <option value="today">Hoje</option>
          <option value="7d">7 dias</option>
          <option value="30d">30 dias</option>
          <option value="month">Este mês</option>
          <option value="lastMonth">Mês passado</option>
          <option value="custom">Personalizado</option>
        </select>
        <template v-if="period === 'custom'">
          <input v-model="customFrom" class="e-admin-input compact" type="date">
          <input v-model="customTo" class="e-admin-input compact" type="date">
        </template>
      </div>
    </template>

    <div v-if="pending" class="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      <div v-for="item in 8" :key="item" class="e-admin-skeleton h-28" />
    </div>

    <template v-else>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Faturamento" :value="brl(summary.totals.revenue)" :hint="summary.period.label" tone="acid" />
        <AdminStatCard label="Lucro líquido estimado" :value="brl(summary.totals.netProfit)" hint="Lucro das vendas - despesas" :tone="summary.totals.netProfit >= 0 ? 'good' : 'danger'" />
        <AdminStatCard label="Despesas" :value="brl(summary.totals.expenses)" hint="Total lançado no período" />
        <AdminStatCard label="Peças vendidas" :value="summary.totals.quantitySold" :hint="`Ticket médio: ${brl(summary.totals.ticketAverage)}`" />
        <AdminStatCard label="Produto mais vendido" :value="summary.topProduct?.name || 'Sem vendas'" :hint="summary.topProduct ? `${summary.topProduct.quantity} unidade(s)` : 'Lance vendas para calcular'" />
        <AdminStatCard label="Estoque baixo" :value="summary.totals.lowStockProducts" hint="Produtos com até 3 unidades" :tone="summary.totals.lowStockProducts ? 'danger' : 'good'" />
        <AdminStatCard label="Produtos publicados" :value="summary.totals.publishedProducts" hint="Aparecem no site público" />
        <AdminStatCard label="Rascunhos/inativos" :value="summary.totals.draftProducts" hint="Não aparecem para o público" />
      </div>

      <div class="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminChart title="Vendas por data" :points="summary.charts.salesByDate" value-key="revenue" empty="Ainda não tem venda lançada nesse período." />
        <AdminChart title="Despesas por data" :points="summary.charts.expensesByDate" value-key="expenses" empty="Sem despesas nesse período." />
        <AdminChart title="Produtos mais vendidos" :points="summary.charts.topProducts" value-key="quantity" empty="Lance vendas para descobrir o produto que tá girando." />
        <AdminChart title="Vendas por categoria" :points="summary.charts.salesByCategory" value-key="revenue" empty="Sem categorias vendidas nesse período." />
      </div>

      <section class="e-admin-card mt-6 p-5">
        <div class="e-admin-section-head compact">
          <div>
            <p class="e-admin-eyebrow">Movimento recente</p>
            <h2>Últimas vendas lançadas</h2>
          </div>
          <NuxtLink class="e-admin-button" to="/admin/vendas">Lançar venda</NuxtLink>
        </div>

        <div v-if="summary.recentSales.length" class="e-admin-table-wrap">
          <table class="e-admin-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Canal</th>
                <th>Qtd.</th>
                <th>Faturamento</th>
                <th>Lucro</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in summary.recentSales" :key="sale.id">
                <td>{{ sale.productNameSnapshot }}</td>
                <td>{{ sale.channel }}</td>
                <td>{{ sale.quantity }}</td>
                <td>{{ brl(sale.totalRevenue) }}</td>
                <td>{{ brl(sale.estimatedProfit) }}</td>
                <td>{{ new Date(sale.soldAt).toLocaleDateString('pt-BR') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="e-admin-empty">
          Ainda não tem venda lançada nesse período. Quando vender no zap, registra aqui que o painel começa a falar.
        </div>
      </section>
    </template>
  </AdminShell>
</template>
