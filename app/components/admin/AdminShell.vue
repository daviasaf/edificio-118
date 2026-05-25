<script setup lang="ts">
const props = defineProps<{ title: string; eyebrow?: string; description?: string }>()

const route = useRoute()
const mobileOpen = ref(false)
const desktopCollapsed = ref(false)
const openGroups = ref<Record<string, boolean>>({ catalogo: true, financeiro: true })

const groups = [
  { key: 'principal', items: [{ to: '/admin', label: 'Dashboard', icon: '▣' }] },
  { key: 'catalogo', label: 'Catálogo', items: [
    { to: '/admin/produtos', label: 'Produtos', icon: '▤' },
    { to: '/admin/drops', label: 'Drops', icon: '◆' },
    { to: '/admin/categorias', label: 'Categorias', icon: '◇' },
    { to: '/admin/materiais', label: 'Materiais', icon: '▥' }
  ] },
  { key: 'financeiro', label: 'Financeiro', items: [
    { to: '/admin/vendas', label: 'Vendas', icon: '↗' },
    { to: '/admin/despesas', label: 'Despesas', icon: '↘' },
    { to: '/admin/relatorios', label: 'Relatórios', icon: '◎' }
  ] }
]

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin' || route.path === '/admin/dashboard'
  return route.path === to || route.path.startsWith(`${to}/`)
}
function toggleGroup(key: string) { openGroups.value = { ...openGroups.value, [key]: !openGroups.value[key] } }
async function logout() { await $fetch('/api/admin/auth/logout', { method: 'POST' }); await navigateTo('/admin') }
</script>

<template>
  <div class="e-admin-layout" :class="{ 'sidebar-collapsed': desktopCollapsed }">
    <aside class="e-admin-sidebar hidden lg:flex">
      <div class="e-admin-brand"><span class="e-admin-brand-mark">118</span><div><p>Edificio</p><small>painel interno</small></div></div>
      <nav class="e-admin-menu">
        <template v-for="group in groups" :key="group.key">
          <button v-if="group.label" class="e-admin-menu-group" type="button" @click="toggleGroup(group.key)"><span>{{ group.label }}</span><b>{{ openGroups[group.key] ? '−' : '+' }}</b></button>
          <div v-if="!group.label || openGroups[group.key]" class="e-admin-menu-sub">
            <NuxtLink v-for="link in group.items" :key="link.to" :to="link.to" class="e-admin-menu-item" :class="{ active: isActive(link.to) }"><span>{{ link.icon }}</span><em>{{ link.label }}</em></NuxtLink>
          </div>
        </template>
      </nav>
      <button class="e-admin-logout" type="button" @click="logout">Sair do admin</button>
    </aside>

    <div v-if="mobileOpen" class="e-admin-mobile-backdrop lg:hidden" @click="mobileOpen = false" />
    <aside class="e-admin-mobile-panel lg:hidden" :class="{ open: mobileOpen }">
      <div class="e-admin-brand"><span class="e-admin-brand-mark">118</span><div><p>Edificio</p><small>painel interno</small></div></div>
      <nav class="e-admin-menu">
        <template v-for="group in groups" :key="group.key">
          <button v-if="group.label" class="e-admin-menu-group" type="button" @click="toggleGroup(group.key)"><span>{{ group.label }}</span><b>{{ openGroups[group.key] ? '−' : '+' }}</b></button>
          <div v-if="!group.label || openGroups[group.key]" class="e-admin-menu-sub">
            <NuxtLink v-for="link in group.items" :key="link.to" :to="link.to" class="e-admin-menu-item" :class="{ active: isActive(link.to) }" @click="mobileOpen = false"><span>{{ link.icon }}</span><em>{{ link.label }}</em></NuxtLink>
          </div>
        </template>
      </nav>
      <button class="e-admin-logout" type="button" @click="logout">Sair do admin</button>
    </aside>

    <main class="e-admin-main">
      <header class="e-admin-topbar">
        <button class="e-admin-icon-button lg:hidden" type="button" aria-label="Abrir menu" @click="mobileOpen = true">☰</button>
        <div><p v-if="props.eyebrow" class="e-admin-eyebrow">{{ props.eyebrow }}</p><h1>{{ props.title }}</h1><p v-if="props.description" class="e-admin-page-description">{{ props.description }}</p></div>
        <slot name="actions" />
      </header>
      <slot />
    </main>
  </div>
</template>
