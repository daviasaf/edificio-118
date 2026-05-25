<script setup lang="ts">
import { z } from 'zod'
import { toErrorMessage } from '~/utils/error'
import { validateAdminForm } from '~/utils/adminValidation'
import type { ExpenseDTO } from '~~/shared/types/expense'
import type { AdminProduct } from '~~/shared/types/product'
const expenseClientSchema = z.object({
  title: z.string().trim().min(2, 'Informe o título da despesa.'),
  category: z.string().trim().min(2, 'Informe a categoria da despesa.'),
  amount: z.coerce.number().positive('A despesa precisa ter um valor válido.'),
  spentAt: z.string().trim().min(1, 'Informe a data da despesa.'),
  description: z.string().optional(),
  expenseType: z.string().trim().min(2, 'Informe o tipo da despesa.'),
  productId: z.string().optional()
})

const props = defineProps<{ expense?: ExpenseDTO | null }>()
const today = new Date().toISOString().slice(0, 10)
const expenseTypes = ['Produção', 'Tecido', 'Estampa', 'Embalagem', 'Tráfego pago', 'Entrega', 'Operacional', 'Fornecedor', 'Outro']
const categories = ['Produção', 'Marketing', 'Entrega', 'Operacional', 'Fornecedor', 'Produto', 'Outro']
const products = ref<AdminProduct[]>([])
onMounted(async () => { products.value = await $fetch<AdminProduct[]>('/api/admin/products').catch(() => []) })
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({ spentAt: today, title: '', category: 'Operacional', amount: 0, description: '', expenseType: 'Outro', productId: '' })
function hydrate(expense?: ExpenseDTO | null) { form.spentAt = expense ? new Date(expense.spentAt).toISOString().slice(0, 10) : today; form.title = expense?.title || ''; form.category = expense?.category || 'Operacional'; form.amount = expense?.amount || 0; form.description = expense?.description || ''; form.expenseType = expense?.expenseType || 'Outro'; form.productId = expense?.productId || '' }
hydrate(props.expense)
watch(() => props.expense, hydrate)
async function save() { saving.value = true; errorMessage.value = ''; successMessage.value = ''; const body = { ...form, spentAt: new Date(`${form.spentAt}T12:00:00`).toISOString(), productId: form.productId || null }; const validation = validateAdminForm(expenseClientSchema, { ...form }); if (!validation.success) { errorMessage.value = validation.message; saving.value = false; return } try { if (props.expense?.id) { await $fetch(`/api/admin/expenses/${props.expense.id}`, { method: 'PUT', body }); successMessage.value = 'Despesa atualizada.'; await navigateTo('/admin/despesas') } else { await $fetch<ExpenseDTO>('/api/admin/expenses', { method: 'POST', body }); successMessage.value = 'Despesa lançada.'; await navigateTo('/admin/despesas') } } catch (error) { errorMessage.value = toErrorMessage(error) } finally { saving.value = false } }
</script>
<template><form class="grid gap-5" @submit.prevent="save"><p v-if="errorMessage" class="e-admin-alert">{{ errorMessage }}</p><p v-if="successMessage" class="e-admin-success">{{ successMessage }}</p><section class="e-admin-card e-admin-form-section"><div class="e-admin-section-head compact"><div><p class="e-admin-eyebrow">Financeiro</p><h2>{{ expense?.id ? 'Editar despesa' : 'Adicionar despesa' }}</h2></div></div><div class="e-admin-form-grid"><div><label class="e-admin-label">Título</label><input v-model="form.title" class="e-admin-input" required></div><div class="grid gap-3 sm:grid-cols-2"><div><label class="e-admin-label">Data</label><input v-model="form.spentAt" class="e-admin-input" type="date" required></div><div><label class="e-admin-label">Valor</label><input v-model.number="form.amount" class="e-admin-input" type="number" min="0" step="0.01" required></div></div><div class="grid gap-3 sm:grid-cols-2"><div><label class="e-admin-label">Categoria</label><select v-model="form.category" class="e-admin-select"><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select></div><div><label class="e-admin-label">Tipo</label><select v-model="form.expenseType" class="e-admin-select"><option v-for="item in expenseTypes" :key="item" :value="item">{{ item }}</option></select></div></div><div><label class="e-admin-label">Produto vinculado opcional</label><select v-model="form.productId" class="e-admin-select"><option value="">Sem produto</option><option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option></select></div><div><label class="e-admin-label">Descrição</label><textarea v-model="form.description" class="e-admin-textarea min-h-24" /></div></div></section><div class="e-admin-actions-row"><NuxtLink to="/admin/despesas" class="e-admin-button secondary">Cancelar</NuxtLink><button class="e-admin-button" type="submit" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar despesa' }}</button></div></form></template>
