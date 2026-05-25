<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import ExpenseForm from '~/components/admin/ExpenseForm.vue'
import type { ExpenseDTO } from '~~/shared/types/expense'

useHead({ bodyAttrs: { class: 'e-admin-body' } })

const route = useRoute()
const id = computed(() => String(route.params.id || ''))
const isNewExpense = computed(() => id.value === 'nova' || id.value === 'novo')

useSeoMeta({ title: () => isNewExpense.value ? 'Adicionar despesa — Admin Edificio 118' : 'Editar despesa — Admin Edificio 118' })

const { data: expense, pending, error } = await useAsyncData<ExpenseDTO | null>(
  () => `expense-${id.value}`,
  async () => isNewExpense.value ? null : await $fetch<ExpenseDTO>(`/api/admin/expenses/${id.value}`),
  { default: () => null }
)
</script>

<template>
  <AdminShell
    :title="isNewExpense ? 'Adicionar despesa' : 'Editar despesa'"
    eyebrow="Financeiro manual"
    :description="isNewExpense ? 'Registre um custo de produção, operação ou divulgação.' : expense ? expense.title : 'Carregando despesa...'"
  >
    <AdminBackLink to="/admin/despesas" label="Voltar para despesas" />
    <ExpenseForm v-if="isNewExpense" class="mt-4" />
    <template v-else>
      <div v-if="pending" class="e-admin-skeleton mt-4 h-80" />
      <div v-else-if="error" class="e-admin-empty mt-4">Não consegui carregar essa despesa.</div>
      <ExpenseForm v-else-if="expense" :expense="expense" class="mt-4" />
      <div v-else class="e-admin-empty mt-4">Despesa não encontrada.</div>
    </template>
  </AdminShell>
</template>
