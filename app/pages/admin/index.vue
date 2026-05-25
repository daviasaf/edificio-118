<script setup lang="ts">
import { z } from 'zod'
import { validateAdminForm } from '~/utils/adminValidation'

const loginClientSchema = z.object({ password: z.string().min(1, 'Informe a senha do admin.') })
useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Admin — Edificio 118' })

const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const { data: session, refresh } = await useFetch<{ authenticated: boolean }>('/api/admin/auth/me', {
  default: () => ({ authenticated: false })
})

async function login() {
  loading.value = true
  errorMessage.value = ''

  const validation = validateAdminForm(loginClientSchema, { password: password.value })
  if (!validation.success) {
    errorMessage.value = validation.message
    loading.value = false
    return
  }

  try {
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { password: password.value }
    })
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error, 'Senha incorreta ou sessão indisponível.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AdminDashboardView v-if="session.authenticated" />

  <div v-else class="e-admin-login-screen">
    <form class="e-admin-login-card" @submit.prevent="login">
      <div class="e-admin-brand large">
        <span class="e-admin-brand-mark">118</span>
        <div>
          <p>Edificio 118</p>
          <small>painel administrativo</small>
        </div>
      </div>

      <h1>Entrar no admin</h1>
      <p>Área interna para controlar produtos, vendas, despesas e relatórios. Nada daqui aparece no público.</p>

      <label class="e-admin-label" for="password">Senha do admin</label>
      <input id="password" v-model="password" class="e-admin-input" type="password" autocomplete="current-password" required>

      <p v-if="errorMessage" class="e-admin-alert mt-4">{{ errorMessage }}</p>

      <button class="e-admin-button mt-5 w-full" type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar no painel' }}
      </button>
    </form>
  </div>
</template>
