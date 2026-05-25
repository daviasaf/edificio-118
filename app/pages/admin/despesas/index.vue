<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import ExpenseForm from '~/components/admin/ExpenseForm.vue'
import type { ExpenseDTO } from '~~/shared/types/expense'

useHead({ bodyAttrs: { class: 'e-admin-body' } })

const route = useRoute()
const isCreateRoute = computed(() => ['nova', 'novo'].includes(String(route.path.split('/').filter(Boolean).at(-1) || '')))
useSeoMeta({ title: () => isCreateRoute.value ? 'Adicionar despesa — Admin Edificio 118' : 'Despesas — Admin Edificio 118' })

const dateFrom = ref('')
const dateTo = ref('')
const typeFilter = ref('')
const errorMessage = ref('')
const expenseToDelete = ref<ExpenseDTO | null>(null)
const expenseTypes = ['Produção', 'Tecido', 'Estampa', 'Embalagem', 'Tráfego pago', 'Entrega', 'Operacional', 'Fornecedor', 'Outro']

const { data: expenses, pending, refresh } = await useFetch<ExpenseDTO[]>('/api/admin/expenses', {
  query: computed(() => ({
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
    expenseType: typeFilter.value || undefined
  })),
  default: () => []
})

const totalExpenses = computed(() => expenses.value.reduce((sum, expense) => sum + expense.amount, 0))

function brl(value?: number | null) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function requestRemove(expense: ExpenseDTO) {
  expenseToDelete.value = expense
}

async function confirmRemove() {
  if (!expenseToDelete.value) return
  try {
    await $fetch(`/api/admin/expenses/${expenseToDelete.value.id}`, { method: 'DELETE' })
    expenseToDelete.value = null
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}
</script>

<template>
  <AdminShell
    v-if="isCreateRoute"
    title="Adicionar despesa"
    eyebrow="Financeiro manual"
    description="Registre custos de produção, tráfego, embalagem, entrega ou operação."
  >
    <AdminBackLink to="/admin/despesas" label="Voltar para despesas" />
    <ClientOnly>
      <ExpenseForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>

  <AdminShell
    v-else
    title="Despesas"
    eyebrow="Financeiro manual"
    description="Lista de despesas. Criação e edição ficam em páginas separadas."
  >
    <template #actions>
      <NuxtLink class="e-admin-button" to="/admin/despesas/nova">Adicionar despesa</NuxtLink>
    </template>

    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>

    <div class="grid gap-4 md:grid-cols-2">
      <AdminStatCard label="Total de despesas" :value="brl(totalExpenses)" tone="danger" />
      <AdminStatCard label="Lançamentos" :value="expenses.length" hint="No filtro atual" />
    </div>

    <section class="e-admin-card p-5 mt-5">
      <div class="e-admin-filters mb-4">
        <input v-model="dateFrom" class="e-admin-input" type="date">
        <input v-model="dateTo" class="e-admin-input" type="date">
        <select v-model="typeFilter" class="e-admin-select">
          <option value="">Todos tipos</option>
          <option v-for="item in expenseTypes" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div v-if="pending" class="e-admin-skeleton h-64" />
      <div v-else-if="expenses.length" class="grid gap-3">
        <article
          v-for="expense in expenses"
          :key="expense.id"
          class="e-admin-list-card e-admin-index-card e-clickable-row"
          role="button"
          tabindex="0"
          @click="navigateTo(`/admin/despesas/${expense.id}`)"
          @keydown.enter="navigateTo(`/admin/despesas/${expense.id}`)"
        >
          <div>
            <strong>{{ expense.title }}</strong>
            <small>{{ new Date(expense.spentAt).toLocaleDateString('pt-BR') }} · {{ expense.expenseType }}</small>
            <p v-if="expense.description">{{ expense.description }}</p>
          </div>
          <div class="e-admin-list-meta">
            <span>{{ expense.category }}</span>
            <span>{{ brl(expense.amount) }}</span>
            <span>{{ expense.product?.name || 'Sem produto' }}</span>
          </div>
          <div class="e-admin-index-actions" @click.stop>
            <AdminActionsMenu>
              <NuxtLink :to="`/admin/despesas/${expense.id}`">Editar</NuxtLink>
              <button type="button" class="danger" @click="requestRemove(expense)">Excluir</button>
            </AdminActionsMenu>
          </div>
        </article>
      </div>
      <div v-else class="e-admin-empty">Nenhuma despesa lançada nesse período.</div>
    </section>

    <AdminConfirmModal
      :open="Boolean(expenseToDelete)"
      eyebrow="Excluir despesa"
      title="Excluir esta despesa?"
      :message="expenseToDelete ? `A despesa ${expenseToDelete.title} será removida dos relatórios.` : ''"
      confirm-label="Excluir despesa"
      tone="danger"
      @update:open="(value) => { if (!value) expenseToDelete = null }"
      @confirm="confirmRemove"
    />
  </AdminShell>
</template>
