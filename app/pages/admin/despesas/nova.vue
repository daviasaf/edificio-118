<script setup lang="ts">
import AdminBackLink from '~/components/admin/AdminBackLink.vue'
import AdminShell from '~/components/admin/AdminShell.vue'
import ExpenseForm from '~/components/admin/ExpenseForm.vue'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Adicionar despesa — Admin Edificio 118' })
</script>

<template>
  <AdminShell title="Adicionar despesa" eyebrow="Financeiro manual" description="Registre um custo de produção, operação ou divulgação.">
    <AdminBackLink to="/admin/despesas" label="Voltar para despesas" />
    <ClientOnly>
      <ExpenseForm class="mt-4" />
      <template #fallback>
        <div class="e-admin-skeleton mt-4 h-72" />
      </template>
    </ClientOnly>
  </AdminShell>
</template>
