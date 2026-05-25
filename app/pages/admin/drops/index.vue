<script setup lang="ts">
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import type { AdminDrop } from '~~/shared/types/drop'
import { toErrorMessage } from '~/utils/error'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Drops — Admin Edificio 118' })

const errorMessage = ref('')
const successMessage = ref('')
const dropToDefault = ref<AdminDrop | null>(null)
const dropToDelete = ref<AdminDrop | null>(null)
const dropToToggleActive = ref<AdminDrop | null>(null)
const activeAction = ref<'activate' | 'deactivate'>('activate')
const { data: drops, refresh, pending } = await useFetch<AdminDrop[]>('/api/admin/drops', { default: () => [] })

function dropProfileImage(drop: AdminDrop) {
  const product = drop.products?.find((item) => item.mainImage || item.images?.[0])
  return product?.mainImage || product?.images?.[0] || ''
}

function dropInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'D'
}

function requestRemove(drop: AdminDrop) {
  errorMessage.value = ''
  successMessage.value = ''
  if (drop.isDefault) {
    errorMessage.value = 'Este é o drop padrão do site. Defina outro drop como padrão antes de excluir.'
    return
  }
  dropToDelete.value = drop
}

function requestToggleActive(drop: AdminDrop) {
  errorMessage.value = ''
  successMessage.value = ''
  activeAction.value = drop.isActive ? 'deactivate' : 'activate'
  dropToToggleActive.value = drop
}

async function confirmRemove() {
  if (!dropToDelete.value) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/admin/drops/${dropToDelete.value.id}`, { method: 'DELETE' })
    dropToDelete.value = null
    successMessage.value = 'Drop excluído.'
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}

async function confirmToggleActive() {
  if (!dropToToggleActive.value) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/admin/drops/${dropToToggleActive.value.id}/active`, {
      method: 'POST',
      body: { active: activeAction.value === 'activate' }
    })
    successMessage.value = activeAction.value === 'activate'
      ? 'Drop ativado. Os outros drops foram desativados automaticamente.'
      : 'Drop desativado. Se nenhum outro estiver ativo, o drop padrão será usado no site.'
    dropToToggleActive.value = null
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}

async function setDefaultDrop() {
  if (!dropToDefault.value) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/admin/drops/${dropToDefault.value.id}/default`, { method: 'POST' })
    successMessage.value = 'Drop padrão definido. Ele será a base do site quando nenhum drop estiver ativo.'
    dropToDefault.value = null
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}
</script>

<template>
  <AdminShell title="Drops" eyebrow="Cor pública" description="Controle lançamentos, drop ativo, drop padrão e a cor pública do site.">
    <template #actions><NuxtLink class="e-admin-button" to="/admin/drops/novo">Novo drop</NuxtLink></template>
    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>
    <p v-if="successMessage" class="e-admin-success mb-4">{{ successMessage }}</p>

    <section class="e-admin-card p-5">
      <div v-if="pending" class="grid gap-3">
        <div v-for="item in 4" :key="item" class="e-admin-skeleton h-24" />
      </div>

      <div v-else-if="drops.length" class="grid gap-3">
        <article
          v-for="drop in drops"
          :key="drop.id"
          class="e-admin-list-card e-admin-index-card e-clickable-row"
          role="button"
          tabindex="0"
          @click="navigateTo(`/admin/drops/${drop.id}`)"
          @keydown.enter="navigateTo(`/admin/drops/${drop.id}`)"
        >
          <div class="e-admin-product-cell">
            <img v-if="dropProfileImage(drop)" :src="dropProfileImage(drop)" :alt="drop.title">
            <span v-else class="e-admin-drop-initials" aria-hidden="true">{{ dropInitials(drop.title) }}</span>
            <div>
              <strong>{{ drop.title }}</strong>
              <small>/{{ drop.slug }}</small>
              <p v-if="drop.description">{{ drop.description }}</p>
            </div>
          </div>

          <div class="e-admin-list-meta">
            <span>{{ drop.productCount || 0 }} produto(s)</span>
            <span class="e-admin-badge" :class="drop.isActive ? 'good' : 'muted'">{{ drop.isActive ? 'Ativo' : 'Inativo' }}</span>
            <span v-if="drop.isDefault" class="e-admin-badge good">Padrão</span>
          </div>

          <div class="e-admin-index-actions" @click.stop>
            <AdminActionsMenu>
              <NuxtLink :to="`/admin/drops/${drop.id}`">Editar</NuxtLink>
              <button type="button" @click="requestToggleActive(drop)">{{ drop.isActive ? 'Desativar drop' : 'Ativar drop' }}</button>
              <button type="button" @click="dropToDefault = drop">Drop padrão</button>
              <button type="button" class="danger" :disabled="drop.isDefault" @click="requestRemove(drop)">Excluir</button>
            </AdminActionsMenu>
          </div>
        </article>
      </div>

      <div v-else class="e-admin-empty">Nenhum drop cadastrado ainda. Crie um para controlar o visual público.</div>
    </section>

    <AdminConfirmModal
      :open="Boolean(dropToToggleActive)"
      :eyebrow="activeAction === 'activate' ? 'Ativar drop' : 'Desativar drop'"
      :title="activeAction === 'activate' ? 'Ativar este drop?' : 'Desativar este drop?'"
      :message="
        dropToToggleActive
          ? activeAction === 'activate'
            ? `Ao ativar ${dropToToggleActive.title}, qualquer outro drop ativo será desativado automaticamente.`
            : `Ao desativar ${dropToToggleActive.title}, o site passa a usar o drop padrão quando não houver outro ativo.`
          : ''
      "
      :confirm-label="activeAction === 'activate' ? 'Ativar drop' : 'Desativar drop'"
      @update:open="(value) => { if (!value) dropToToggleActive = null }"
      @confirm="confirmToggleActive"
    />

    <AdminConfirmModal
      :open="Boolean(dropToDefault)"
      eyebrow="Drop padrão"
      title="Definir este drop como padrão?"
      :message="dropToDefault ? 'O drop padrão será usado como base do site quando não houver nenhum drop ativo. Quando o visitante clicar em “Ver o drop”, ele verá todas as peças, sem filtro específico.' : ''"
      confirm-label="Definir como padrão"
      @update:open="(value) => { if (!value) dropToDefault = null }"
      @confirm="setDefaultDrop"
    />

    <AdminConfirmModal
      :open="Boolean(dropToDelete)"
      eyebrow="Excluir drop"
      title="Excluir este drop?"
      :message="dropToDelete ? `O drop ${dropToDelete.title} será removido. Os produtos vinculados ficarão sem drop.` : ''"
      confirm-label="Excluir drop"
      tone="danger"
      @update:open="(value) => { if (!value) dropToDelete = null }"
      @confirm="confirmRemove"
    />
  </AdminShell>
</template>
