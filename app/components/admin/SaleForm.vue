<script setup lang="ts">
import { z } from 'zod'
import { toErrorMessage } from '~/utils/error'
import { validateAdminForm } from '~/utils/adminValidation'
import type { ManualSaleDTO } from '~~/shared/types/sale'
import type { AdminProduct } from '~~/shared/types/product'

const saleClientSchema = z.object({
  productId: z.string().trim().min(1, 'Escolha um produto para registrar a venda.'),
  soldAt: z.string().trim().min(1, 'Informe a data da venda.'),
  quantity: z.coerce.number().int().positive('Informe uma quantidade maior que zero.'),
  unitPrice: z.coerce.number().min(0, 'Preço não pode ser negativo.'),
  unitCost: z.coerce.number().min(0, 'Custo não pode ser negativo.'),
  discount: z.coerce.number().min(0, 'Desconto não pode ser negativo.'),
  channel: z.string().trim().min(2, 'Informe a forma de venda.'),
  notes: z.string().optional(),
  shouldDecreaseStock: z.boolean()
})

const props = defineProps<{ sale?: ManualSaleDTO | null }>()
const today = new Date().toISOString().slice(0, 10)
const channels = ['WhatsApp', 'Instagram', 'Presencial', 'Outro']
const products = ref<AdminProduct[]>([])
onMounted(async () => { products.value = await $fetch<AdminProduct[]>('/api/admin/products').catch(() => []) })
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({ soldAt: today, productId: '', quantity: 1, unitPrice: 0, unitCost: 0, discount: 0, channel: 'WhatsApp', notes: '', shouldDecreaseStock: true })
const selectedProduct = computed(() => products.value.find((product) => product.id === form.productId))
const salePreview = computed(() => Math.max(0, Number(form.unitPrice || 0) * Number(form.quantity || 0) - Number(form.discount || 0)))
const profitPreview = computed(() => salePreview.value - Number(form.unitCost || 0) * Number(form.quantity || 0))
function brl(value?: number | null) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0) }
function hydrate(sale?: ManualSaleDTO | null) {
  form.soldAt = sale ? new Date(sale.soldAt).toISOString().slice(0, 10) : today
  form.productId = sale?.productId || ''
  form.quantity = sale?.quantity || 1
  form.unitPrice = sale?.unitPrice || 0
  form.unitCost = sale?.unitCost || 0
  form.discount = sale?.discount || 0
  form.channel = sale?.channel || 'WhatsApp'
  form.notes = sale?.notes || ''
  form.shouldDecreaseStock = sale?.shouldDecreaseStock ?? true
}
hydrate(props.sale)
watch(() => props.sale, hydrate)
watch(() => form.productId, () => { if (!props.sale?.id && selectedProduct.value) { form.unitPrice = selectedProduct.value.promotionalPrice || selectedProduct.value.salePrice; form.unitCost = selectedProduct.value.costPrice || 0 } })
async function save() {
  saving.value = true; errorMessage.value = ''; successMessage.value = ''
  const body = { ...form, soldAt: new Date(`${form.soldAt}T12:00:00`).toISOString() }
  const validation = validateAdminForm(saleClientSchema, { ...form })
  if (!validation.success) {
    errorMessage.value = validation.message
    saving.value = false
    return
  }

  try {
    if (props.sale?.id) { await $fetch(`/api/admin/sales/${props.sale.id}`, { method: 'PUT', body }); successMessage.value = 'Venda atualizada.'; await navigateTo('/admin/vendas') }
    else { await $fetch<ManualSaleDTO>('/api/admin/sales', { method: 'POST', body }); successMessage.value = 'Venda lançada.'; await navigateTo('/admin/vendas') }
  } catch (error) { errorMessage.value = toErrorMessage(error) } finally { saving.value = false }
}
</script>
<template><form class="grid gap-5" @submit.prevent="save"><p v-if="errorMessage" class="e-admin-alert">{{ errorMessage }}</p><p v-if="successMessage" class="e-admin-success">{{ successMessage }}</p><section class="e-admin-card e-admin-form-section"><div class="e-admin-section-head compact"><div><p class="e-admin-eyebrow">Venda manual</p><h2>{{ sale?.id ? 'Editar venda' : 'Registrar venda' }}</h2></div></div><div class="e-admin-form-grid"><div><label class="e-admin-label">Produto vendido</label><select v-model="form.productId" class="e-admin-select" required><option value="">Escolha um produto</option><option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} — estoque {{ product.stock }}</option></select></div><div class="grid gap-3 sm:grid-cols-2"><div><label class="e-admin-label">Data</label><input v-model="form.soldAt" class="e-admin-input" type="date" required></div><div><label class="e-admin-label">Quantidade</label><input v-model.number="form.quantity" class="e-admin-input" type="number" min="1" step="1" required></div></div><div class="grid gap-3 sm:grid-cols-3"><div><label class="e-admin-label">Preço un.</label><input v-model.number="form.unitPrice" class="e-admin-input" type="number" min="0" step="0.01"></div><div><label class="e-admin-label">Custo un.</label><input v-model.number="form.unitCost" class="e-admin-input" type="number" min="0" step="0.01"></div><div><label class="e-admin-label">Desconto</label><input v-model.number="form.discount" class="e-admin-input" type="number" min="0" step="0.01"></div></div><div><label class="e-admin-label">Canal</label><select v-model="form.channel" class="e-admin-select"><option v-for="channel in channels" :key="channel" :value="channel">{{ channel }}</option></select></div><div><label class="e-admin-label">Observação</label><textarea v-model="form.notes" class="e-admin-textarea min-h-24" /></div><label class="e-admin-check"><input v-model="form.shouldDecreaseStock" type="checkbox"> Baixar estoque automaticamente</label><div class="e-admin-preview-box"><span>Total: <strong>{{ brl(salePreview) }}</strong></span><span>Lucro estimado: <strong>{{ brl(profitPreview) }}</strong></span></div></div></section><div class="e-admin-actions-row"><NuxtLink to="/admin/vendas" class="e-admin-button secondary">Cancelar</NuxtLink><button class="e-admin-button" type="submit" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar venda' }}</button></div></form></template>
