<script setup lang="ts">
useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Configurações — Admin Edificio 118' })

const config = useRuntimeConfig()
const publicConfig = config.public
</script>

<template>
  <AdminShell title="Configurações" eyebrow="Ambiente" description="Conferência rápida das variáveis públicas e caminhos internos.">
    <div class="grid gap-5 lg:grid-cols-2">
      <section class="e-admin-card p-5">
        <div class="e-admin-section-head compact"><div><p class="e-admin-eyebrow">Público</p><h2>Dados visíveis do site</h2></div></div>
        <div class="e-admin-info-list">
          <div><span>Nome do site</span><strong>{{ publicConfig.siteName }}</strong></div>
          <div><span>URL pública</span><strong>{{ publicConfig.siteUrl }}</strong></div>
          <div><span>WhatsApp</span><strong>{{ publicConfig.whatsappNumber }}</strong></div>
          <div><span>Placeholder</span><strong>{{ publicConfig.placeholderImage }}</strong></div>
        </div>
      </section>

      <section class="e-admin-card p-5">
        <div class="e-admin-section-head compact"><div><p class="e-admin-eyebrow">Segurança</p><h2>Rotas internas</h2></div></div>
        <div class="e-admin-info-list">
          <div><span>Admin</span><strong>/admin</strong></div>
          <div><span>Login</span><strong>ADMIN_SENHA via .env</strong></div>
          <div><span>Sessão</span><strong>Cookie HTTP-only</strong></div>
          <div><span>API interna</span><strong>/api/admin/* protegida</strong></div>
        </div>
      </section>
    </div>
  </AdminShell>
</template>
