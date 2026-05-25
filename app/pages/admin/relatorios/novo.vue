<script setup lang="ts">
import { z } from 'zod'
import { validateAdminForm } from '~/utils/adminValidation'
import type { SavedReportDTO } from '~~/shared/types/report'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Novo relatório — Admin Edificio 118' })

const reportTypes = ['Vendas', 'Lucro', 'Despesas', 'Produtos mais vendidos', 'Categorias mais vendidas', 'Resumo financeiro', 'Estoque']
const groupTypes = [{ label: 'Data', value: 'data' }, { label: 'Produto', value: 'produto' }, { label: 'Categoria', value: 'categoria' }, { label: 'Canal/tipo', value: 'canal' }]
const metricOptions = ['Faturamento', 'Lucro', 'Despesas', 'Quantidade vendida', 'Ticket médio', 'Margem estimada']
const reportClientSchema = z.object({ type: z.string().min(1, 'Escolha o tipo de relatório.'), groupBy: z.string().min(1, 'Escolha como agrupar o relatório.'), metrics: z.array(z.string()).min(1, 'Escolha pelo menos uma métrica.'), dateFrom: z.string().min(1, 'Escolha a data inicial.'), dateTo: z.string().min(1, 'Escolha a data final.') }).superRefine((value, ctx) => { if (new Date(value.dateFrom) > new Date(value.dateTo)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateTo'], message: 'A data final precisa ser depois da data inicial.' }) })
const form = reactive({ type: 'Resumo financeiro', groupBy: 'data', metrics: ['Faturamento', 'Lucro', 'Despesas'], dateFrom: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().slice(0, 10), dateTo: new Date().toISOString().slice(0, 10) })
const loading = ref(false); const errorMessage = ref('')
function toggleMetric(metric: string) { form.metrics = form.metrics.includes(metric) ? form.metrics.filter((item) => item !== metric) : [...form.metrics, metric] }
async function generate() {
  loading.value = true; errorMessage.value = ''
  const validation = validateAdminForm(reportClientSchema, { ...form })
  if (!validation.success) { errorMessage.value = validation.message; loading.value = false; return }
  try { const report = await $fetch<SavedReportDTO>('/api/admin/reports/generate', { method: 'POST', body: { ...form, dateFrom: new Date(`${form.dateFrom}T00:00:00`).toISOString(), dateTo: new Date(`${form.dateTo}T23:59:59`).toISOString() } }); await navigateTo(`/admin/relatorios/${report.id}`) }
  catch (error) { errorMessage.value = toErrorMessage(error) } finally { loading.value = false }
}
</script>
<template>
  <AdminShell title="Novo relatório" eyebrow="Gerador" description="Escolha período, agrupamento e métricas. Ao gerar, o relatório fica salvo.">
    <AdminBackLink to="/admin/relatorios" label="Voltar para relatórios" />
    <section class="e-admin-card e-admin-form-section mt-4">
      <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>
      <div class="grid gap-4 md:grid-cols-2">
        <div><label class="e-admin-label">Tipo de análise</label><select v-model="form.type" class="e-admin-select"><option v-for="type in reportTypes" :key="type" :value="type">{{ type }}</option></select></div>
        <div><label class="e-admin-label">Agrupar por</label><select v-model="form.groupBy" class="e-admin-select"><option v-for="group in groupTypes" :key="group.value" :value="group.value">{{ group.label }}</option></select></div>
        <div><label class="e-admin-label">Data inicial</label><input v-model="form.dateFrom" class="e-admin-input" type="date"></div>
        <div><label class="e-admin-label">Data final</label><input v-model="form.dateTo" class="e-admin-input" type="date"></div>
      </div>
      <div class="mt-5"><label class="e-admin-label">Métricas</label><div class="e-admin-chip-grid"><button v-for="metric in metricOptions" :key="metric" type="button" class="e-admin-chip" :class="{ active: form.metrics.includes(metric) }" @click="toggleMetric(metric)">{{ metric }}</button></div></div>
      <div class="e-admin-actions-row mt-5"><button class="e-admin-button" type="button" :disabled="loading" @click="generate">{{ loading ? 'Gerando...' : 'Gerar e salvar relatório' }}</button></div>
    </section>
  </AdminShell>
</template>
