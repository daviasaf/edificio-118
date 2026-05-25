<script setup lang="ts">
const props = defineProps<{
  title: string
  points: Array<Record<string, string | number | undefined>>
  valueKey: string
  labelKey?: string
  empty?: string
}>()

const labelKey = computed(() => props.labelKey || 'label')
const maxValue = computed(() => Math.max(...props.points.map((point) => Number(point[props.valueKey] || 0)), 0))

function width(point: Record<string, string | number | undefined>) {
  const value = Number(point[props.valueKey] || 0)
  if (!maxValue.value) return '0%'
  return `${Math.max(4, Math.round((value / maxValue.value) * 100))}%`
}

function formatNumber(value: string | number | undefined) {
  const number = Number(value || 0)
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(number)
}
</script>

<template>
  <section class="e-admin-card e-admin-chart-card">
    <div class="e-admin-section-head compact">
      <div>
        <p class="e-admin-eyebrow">Gráfico</p>
        <h2>{{ title }}</h2>
      </div>
    </div>

    <div v-if="points.length" class="e-admin-chart-list">
      <div v-for="point in points" :key="String(point[labelKey])" class="e-admin-chart-row">
        <div class="e-admin-chart-label">
          <span>{{ point[labelKey] }}</span>
          <strong>{{ formatNumber(point[valueKey]) }}</strong>
        </div>
        <div class="e-admin-chart-track">
          <div class="e-admin-chart-fill" :style="{ width: width(point) }" />
        </div>
      </div>
    </div>

    <div v-else class="e-admin-empty small">
      {{ empty || 'Lança as primeiras vendas pra esse gráfico começar a falar.' }}
    </div>
  </section>
</template>
