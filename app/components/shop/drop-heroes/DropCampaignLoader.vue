<script setup lang="ts">
const props = defineProps<{
  dropTitle?: string
  accentColor?: string
  progress?: number
  isReady?: boolean
  state?: 'loading' | 'ready' | 'entering' | 'finished' | 'error'
}>()

const titleScaleClass = computed(() => {
  const words = (props.dropTitle || '').trim().split(/\s+/).filter(Boolean).length
  if (words >= 10) return 'is-title-xl'
  if (words >= 7) return 'is-title-lg'
  if (words >= 5) return 'is-title-md'
  return 'is-title-short'
})
</script>

<template>
  <Transition name="e-campaign-loader">
    <div
      v-if="state !== 'finished'"
      class="e-campaign-loader"
      :class="[`is-${state || 'loading'}`, titleScaleClass, { ready: isReady }]"
      :style="{ '--loader-accent': accentColor || '#D6FF2F' }"
      role="status"
      aria-live="polite"
    >
      <div class="e-loader-grain" aria-hidden="true" />
      <div class="e-loader-frame">
        <span class="e-loader-kicker">EDIFICIO 118</span>
        <strong>{{ dropTitle || 'Preparando o drop' }}</strong>
        <p>{{ isReady ? 'abrindo campanha' : 'carregando o drop' }}</p>
        <div class="e-loader-progress" aria-hidden="true">
          <span :style="{ transform: `scaleX(${Math.min(Math.max(progress || 0, 0), 100) / 100})` }" />
        </div>
        <small>{{ Math.round(Math.min(Math.max(progress || 0, 0), 100)) }}%</small>
      </div>
    </div>
  </Transition>
</template>
