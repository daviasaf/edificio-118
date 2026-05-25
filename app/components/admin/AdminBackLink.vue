<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  label?: string
}>(), {
  label: 'Voltar'
})
</script>

<template>
  <NuxtLink :to="to" class="e-admin-back-link">← {{ label }}</NuxtLink>
</template>
