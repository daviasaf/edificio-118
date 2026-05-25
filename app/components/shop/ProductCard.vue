<script setup lang="ts">
import { formatCurrency } from '~/utils/formatCurrency'
import type { PublicProduct } from '~~/shared/types/product'

const props = defineProps<{
  product: PublicProduct
}>()

const image = computed(() => props.product.mainImage || props.product.images[0] || '/images/editorial/corre-com-nos.webp')
const price = computed(() => props.product.promotionalPrice || props.product.salePrice)
</script>

<template>
  <NuxtLink :to="`/produto/${product.slug}`" class="e-card e-product-card block">
    <div class="e-product-image">
      <span v-if="product.isFeatured" class="e-stamp e-product-badge">drop quente</span>
      <img :src="image" :alt="product.name" loading="lazy">
    </div>
    <div class="e-product-info">
      <div class="mb-3 flex items-center justify-between gap-3">
        <span class="text-xs font-black uppercase tracking-[0.16em] text-[var(--e-faint)]">
          {{ product.category?.name || 'Peça' }}
        </span>
        <span v-if="product.stock > 0" class="text-xs font-black uppercase tracking-[0.14em] text-[var(--e-acid)]">
          {{ product.stock }} no corre
        </span>
      </div>
      <h3 class="e-product-title">{{ product.name }}</h3>
      <p class="e-body-text mb-4 line-clamp-2 text-sm">{{ product.shortDescription }}</p>
      <div class="e-price">
        <strong>{{ formatCurrency(price) }}</strong>
        <del v-if="product.promotionalPrice">{{ formatCurrency(product.salePrice) }}</del>
      </div>
    </div>
  </NuxtLink>
</template>
