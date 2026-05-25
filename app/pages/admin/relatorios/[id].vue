<script setup lang="ts">
import type { SavedReportDTO } from '~~/shared/types/report'
useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Relatório — Admin Edificio 118' })
const route = useRoute()
const id = computed(() => String(route.params.id || ''))
const { data: report, pending, error } = await useFetch<SavedReportDTO>(() => `/api/admin/reports/${id.value}`, { default: () => null as unknown as SavedReportDTO })
function brl(value?: number | null) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0) }
function formatCell(value: string | number) { return typeof value === 'number' ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value) : value }
const keys = computed(() => report.value?.rows?.[0] ? Object.keys(report.value.rows[0]) : [])
async function exportPdf() {
  if (!report.value) return
  const [{ jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const autoTable = autoTableModule.default
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const margin = 40
  const period = `${new Date(report.value.dateFrom).toLocaleDateString('pt-BR')} até ${new Date(report.value.dateTo).toLocaleDateString('pt-BR')}`
  doc.setFillColor(2, 6, 23); doc.rect(0, 0, doc.internal.pageSize.getWidth(), 92, 'F')
  doc.setTextColor(214, 255, 47); doc.setFontSize(11); doc.text('EDIFICIO 118', margin, 34)
  doc.setTextColor(249, 250, 251); doc.setFontSize(24); doc.text(report.value.title, margin, 66)
  doc.setTextColor(55, 65, 81); doc.setFontSize(10); doc.text(`Período: ${period}`, margin, 118); doc.text(`Gerado em: ${new Date(report.value.generatedAt).toLocaleString('pt-BR')}`, margin, 134); doc.text('Observação: dados financeiros lançados manualmente no painel administrativo.', margin, 150)
  autoTable(doc, { startY: 176, head: [['Resumo', 'Valor']], body: Object.entries(report.value.totals).map(([k,v]) => [k, typeof v === 'number' && /faturamento|lucro|despesas|ticket/i.test(k) ? brl(v) : formatCell(v)]), theme: 'grid', headStyles: { fillColor: [17, 24, 39], textColor: [249,250,251] }, styles: { fontSize: 9, cellPadding: 6 }, margin: { left: margin, right: margin } })
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 250
  autoTable(doc, { startY: finalY + 22, head: [keys.value], body: report.value.rows.map((row) => keys.value.map((key) => formatCell(row[key]))), theme: 'striped', headStyles: { fillColor: [24,24,27], textColor: [249,250,251] }, styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' }, margin: { left: margin, right: margin } })
  doc.save(`relatorio-edificio-118-${report.value.id}.pdf`)
}
</script>
<template>
  <AdminShell title="Detalhe do relatório" eyebrow="Relatório salvo" :description="report ? report.title : 'Carregando relatório...'">
    <AdminBackLink to="/admin/relatorios" label="Voltar para relatórios" />
    <div v-if="pending" class="e-admin-skeleton mt-4 h-96" />
    <div v-else-if="error || !report" class="e-admin-empty mt-4">Relatório não encontrado.</div>
    <section v-else class="e-admin-card p-5 mt-4">
      <div class="e-admin-section-head compact"><div><p class="e-admin-eyebrow">{{ report.type }} · {{ report.groupBy }}</p><h2>{{ report.title }}</h2><p class="e-admin-help">{{ new Date(report.dateFrom).toLocaleDateString('pt-BR') }} até {{ new Date(report.dateTo).toLocaleDateString('pt-BR') }} · gerado em {{ new Date(report.generatedAt).toLocaleString('pt-BR') }}</p></div><button class="e-admin-button" type="button" @click="exportPdf">Baixar PDF</button></div>
      <div class="grid gap-3 md:grid-cols-3 my-5"><AdminStatCard v-for="(value, key) in report.totals" :key="key" :label="String(key)" :value="typeof value === 'number' ? formatCell(value) : String(value)" /></div>
      <div class="e-admin-table-wrap"><table class="e-admin-table"><thead><tr><th v-for="key in keys" :key="key">{{ key }}</th></tr></thead><tbody><tr v-for="(row, index) in report.rows" :key="index"><td v-for="key in keys" :key="key">{{ formatCell(row[key]) }}</td></tr></tbody></table></div>
    </section>
  </AdminShell>
</template>
