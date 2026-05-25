<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
const isProducts = computed(() => route.path.startsWith('/produtos'))
</script>

<template>
  <header class="e-header">
    <div class="e-container e-header-inner">
      <NuxtLink to="/" class="e-logo" aria-label="Voltar para a home do Edificio 118">
        <span>Edificio</span>
        <span>118</span>
        <small>vive o corre</small>
      </NuxtLink>

      <nav class="e-nav" aria-label="Navegacao principal">
        <NuxtLink v-if="!isHome" to="/">Home</NuxtLink>
        <NuxtLink v-if="!isProducts" to="/produtos">Produtos</NuxtLink>
      </nav>
    </div>
  </header>
</template>
