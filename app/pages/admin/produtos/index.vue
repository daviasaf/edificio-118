<script setup lang="ts">
import type { AdminProduct } from '~~/shared/types/product'
import type { CategoryDTO } from '~~/shared/types/category'
import type { AdminDrop } from '~~/shared/types/drop'

useHead({ bodyAttrs: { class: 'e-admin-body' } })
useSeoMeta({ title: 'Produtos — Admin Edificio 118' })

const q = ref('')
const status = ref('')
const categoryId = ref('')
const dropId = ref('')
const lowStock = ref(false)
const errorMessage = ref('')
const productToDelete = ref<AdminProduct | null>(null)

const { data: categories } = await useFetch<CategoryDTO[]>('/api/admin/categories', { default: () => [] })
const { data: drops } = await useFetch<AdminDrop[]>('/api/admin/drops', { default: () => [] })
const { data: products, pending, refresh } = await useFetch<AdminProduct[]>('/api/admin/products', {
  query: computed(() => ({
    q: q.value || undefined,
    status: status.value || undefined,
    categoryId: categoryId.value || undefined,
    dropId: dropId.value || undefined,
    lowStock: lowStock.value ? 'true' : undefined
  })),
  default: () => []
})

function brl(value?: number | null) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function productPayload(product: AdminProduct, patch: Partial<AdminProduct>) {
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    story: product.story || '',
    materialNote: product.materialNote || '',
    salePrice: product.salePrice,
    promotionalPrice: product.promotionalPrice ?? null,
    costPrice: product.costPrice ?? null,
    stock: product.stock,
    sizes: product.sizes,
    colors: product.colors,
    images: product.images,
    mainImage: product.mainImage || '',
    isActive: product.isActive,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    allowWhatsapp: product.allowWhatsapp,
    displayOrder: product.displayOrder,
    categoryId: product.categoryId || null,
    materialId: product.materialId || null,
    dropId: product.dropId || null,
    internalNotes: product.internalNotes || '',
    ...patch
  }
}

async function quickUpdate(product: AdminProduct, patch: Partial<AdminProduct>) {
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/products/${product.id}`, { method: 'PUT', body: productPayload(product, patch) })
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}

function requestRemoveProduct(product: AdminProduct) {
  productToDelete.value = product
}

async function confirmRemoveProduct() {
  if (!productToDelete.value) return
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/products/${productToDelete.value.id}`, { method: 'DELETE' })
    productToDelete.value = null
    await refresh()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}
</script>

<template>
  <AdminShell
    title="Produtos"
    eyebrow="Catálogo interno"
    description="Crie, publique, destaque e organize as peças que aparecem no site."
  >
    <template #actions>
      <NuxtLink class="e-admin-button" to="/admin/produtos/novo">Novo produto</NuxtLink>
    </template>

    <p v-if="errorMessage" class="e-admin-alert mb-4">{{ errorMessage }}</p>

    <section class="e-admin-card p-5">
      <div class="e-admin-filters">
        <input v-model="q" class="e-admin-input" placeholder="Buscar por nome, slug ou descrição">
        <select v-model="status" class="e-admin-select">
          <option value="">Todos os status</option>
          <option value="published">Publicado</option>
          <option value="draft">Rascunho</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
        <select v-model="categoryId" class="e-admin-select">
          <option value="">Todas as categorias</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <select v-model="dropId" class="e-admin-select">
          <option value="">Todos os drops</option>
          <option v-for="drop in drops" :key="drop.id" :value="drop.id">{{ drop.title }}</option>
        </select>
        <label class="e-admin-filter-check"><input v-model="lowStock" type="checkbox"> Estoque baixo</label>
      </div>

      <div v-if="pending" class="grid gap-3 mt-5">
        <div v-for="item in 5" :key="item" class="e-admin-skeleton h-20" />
      </div>

      <template v-else-if="products.length">
        <div class="e-admin-mobile-cards mt-5">
          <article v-for="product in products" :key="product.id" class="e-admin-list-card product e-clickable-row" role="button" tabindex="0" @click="navigateTo(`/admin/produtos/${product.id}`)" @keydown.enter="navigateTo(`/admin/produtos/${product.id}`)">
            <div class="e-admin-product-cell">
              <img :src="product.mainImage || product.images[0] || '/images/editorial/corre-com-nos.webp'" :alt="product.name">
              <div>
                <strong>{{ product.name }}</strong>
                <small>/{{ product.slug }}</small>
              </div>
            </div>
            <div class="e-admin-list-meta">
              <span>{{ product.category?.name || 'Sem categoria' }}</span>
              <span>{{ product.drop?.title || 'Sem drop' }}</span>
              <span :class="product.stock <= 3 ? 'text-red-300 font-bold' : ''">{{ product.stock }} em estoque</span>
              <span>{{ brl(product.promotionalPrice || product.salePrice) }}</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <span class="e-admin-badge" :class="product.isPublished ? 'good' : 'muted'">{{ product.isPublished ? 'Publicado' : 'Rascunho' }}</span>
              <span v-if="product.isFeatured" class="e-admin-badge acid">Destaque</span>
              <span v-if="!product.isActive" class="e-admin-badge danger">Inativo</span>
            </div>
            <div class="e-admin-row-actions left" @click.stop>
              <AdminActionsMenu>
                <NuxtLink :to="`/admin/produtos/${product.id}`">Editar</NuxtLink>
                <button type="button" @click="quickUpdate(product, { isPublished: !product.isPublished })">{{ product.isPublished ? 'Despublicar' : 'Publicar' }}</button>
                <button type="button" @click="quickUpdate(product, { isFeatured: !product.isFeatured })">{{ product.isFeatured ? 'Tirar destaque' : 'Destacar' }}</button>
                <button type="button" class="danger" @click="requestRemoveProduct(product)">Excluir</button>
              </AdminActionsMenu>
            </div>
          </article>
        </div>

        <div class="e-admin-desktop-table e-admin-table-wrap mt-5">
          <table class="e-admin-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Status</th>
                <th>Categoria</th>
                <th>Drop</th>
                <th>Estoque</th>
                <th>Preço</th>
                <th>Atualizado</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="e-clickable-row" @click="navigateTo(`/admin/produtos/${product.id}`)">
                <td>
                  <div class="e-admin-product-cell">
                    <img :src="product.mainImage || product.images[0] || '/images/editorial/corre-com-nos.webp'" :alt="product.name">
                    <div>
                      <strong>{{ product.name }}</strong>
                      <small>/{{ product.slug }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span class="e-admin-badge" :class="product.isPublished ? 'good' : 'muted'">{{ product.isPublished ? 'Publicado' : 'Rascunho' }}</span>
                    <span v-if="product.isFeatured" class="e-admin-badge acid">Destaque</span>
                    <span v-if="!product.isActive" class="e-admin-badge danger">Inativo</span>
                  </div>
                </td>
                <td>{{ product.category?.name || 'Sem categoria' }}</td>
                <td>{{ product.drop?.title || 'Sem drop' }}</td>
                <td :class="product.stock <= 3 ? 'text-red-300 font-bold' : ''">{{ product.stock }}</td>
                <td>{{ brl(product.promotionalPrice || product.salePrice) }}</td>
                <td>{{ product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('pt-BR') : '-' }}</td>
                <td>
                  <div class="e-admin-row-actions" @click.stop>
                    <AdminActionsMenu>
                      <NuxtLink :to="`/admin/produtos/${product.id}`">Editar</NuxtLink>
                      <button type="button" @click="quickUpdate(product, { isPublished: !product.isPublished })">{{ product.isPublished ? 'Despublicar' : 'Publicar' }}</button>
                      <button type="button" @click="quickUpdate(product, { isFeatured: !product.isFeatured })">{{ product.isFeatured ? 'Tirar destaque' : 'Destacar' }}</button>
                      <button type="button" class="danger" @click="requestRemoveProduct(product)">Excluir</button>
                    </AdminActionsMenu>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="e-admin-empty mt-5">
        Nenhum produto bateu com esses filtros. Crie uma peça ou limpe a busca.
      </div>
    </section>

    <AdminConfirmModal
      :open="Boolean(productToDelete)"
      eyebrow="Excluir produto"
      title="Excluir esta peça?"
      :message="productToDelete ? `A peça ${productToDelete.name} será removida do catálogo interno. Essa ação não pode ser desfeita.` : ''"
      confirm-label="Excluir produto"
      tone="danger"
      @update:open="(value) => { if (!value) productToDelete = null }"
      @confirm="confirmRemoveProduct"
    />
  </AdminShell>
</template>
