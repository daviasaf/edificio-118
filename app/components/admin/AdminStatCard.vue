<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'good' | 'danger' | 'acid'
}>()
</script>

<template>
  <article class="e-admin-stat" :class="tone || 'default'">
    <p>{{ label }}</p>
    <strong>{{ value }}</strong>
    <small v-if="hint">{{ hint }}</small>
  </article>
</template>
