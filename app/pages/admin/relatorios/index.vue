<script setup lang="ts">
import type { SavedReportDTO } from '~~/shared/types/report'
useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Relatórios — Admin Edificio 118' })
const errorMessage = ref('')
const reportToDelete = ref<SavedReportDTO | null>(null)
const { data: reports, refresh, pending } = await useFetch<SavedReportDTO[]>('/api/admin/reports', { default: () => [] })
function period(report: SavedReportDTO) { return `${new Date(report.dateFrom).toLocaleDateString('pt-BR')} até ${new Date(report.dateTo).toLocaleDateString('pt-BR')}` }
function requestRemove(report: SavedReportDTO) { reportToDelete.value = report }
async function confirmRemove() {
  if (!reportToDelete.value) return
  try { await $fetch(`/api/admin/reports/${reportToDelete.value.id}`, { method: 'DELETE' }); reportToDelete.value = null; await refresh() } catch (error) { errorMessage.value = toErrorMessage(error) }
}
</script>
<template>
  <AdminShell title="Relatórios" eyebrow="Histórico salvo" description="Histórico de relatórios gerados. O index é só o log; a criação fica em uma tela separada.">
    <template #actions><NuxtLink class="e-admin-button" to="/admin/relatorios/novo">Criar relatório</NuxtLink></template>
    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>
    <section class="e-admin-card p-5">
      <div v-if="pending" class="grid gap-3"><div v-for="item in 4" :key="item" class="e-admin-skeleton h-20" /></div>
      <div v-else-if="reports.length" class="grid gap-3">
        <article v-for="report in reports" :key="report.id" class="e-admin-list-card e-admin-index-card e-clickable-row" role="button" tabindex="0" @click="navigateTo(`/admin/relatorios/${report.id}`)" @keydown.enter="navigateTo(`/admin/relatorios/${report.id}`)">
          <div><strong>{{ report.title }}</strong><small>{{ report.type }} · {{ report.groupBy }} · {{ period(report) }}</small><p>Gerado em {{ new Date(report.createdAt).toLocaleString('pt-BR') }}</p></div>
          <div class="e-admin-list-meta"><span class="e-admin-badge good">{{ report.rows.length }} linha(s)</span><span>{{ report.metrics.join(', ') }}</span></div>
          <div class="e-admin-index-actions" @click.stop><AdminActionsMenu><NuxtLink :to="`/admin/relatorios/${report.id}`">Ver detalhe</NuxtLink><NuxtLink :to="`/admin/relatorios/${report.id}/editar`">Editar</NuxtLink><button class="danger" type="button" @click="requestRemove(report)">Excluir</button></AdminActionsMenu></div>
        </article>
      </div>
      <div v-else class="e-admin-empty">Nenhum relatório gerado ainda. Crie o primeiro em “Novo relatório”.</div>
    </section>

    <AdminConfirmModal
      :open="Boolean(reportToDelete)"
      eyebrow="Excluir relatório"
      title="Excluir este relatório?"
      :message="reportToDelete ? `O relatório ${reportToDelete.title} será removido do histórico.` : ''"
      confirm-label="Excluir relatório"
      tone="danger"
      @update:open="(value) => { if (!value) reportToDelete = null }"
      @confirm="confirmRemove"
    />
  </AdminShell>
</template>
