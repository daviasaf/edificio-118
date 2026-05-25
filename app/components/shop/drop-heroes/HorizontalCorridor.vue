<script setup lang="ts">
import type { DropVisualItem, PublicDrop } from '~~/shared/types/drop'
import type { PublicProduct } from '~~/shared/types/product'
import { formatCurrency } from '~/utils/formatCurrency'

const props = defineProps<{ drop: PublicDrop; visualItems: DropVisualItem[]; products: PublicProduct[]; campaignReady?: boolean }>()
const rootRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const { scrollTo, resizeLenis, prefersReducedMotion } = useDropScrollEffects(rootRef)

const items = computed(() => props.visualItems.filter((item) => item.image).slice(0, 10))
const heroItem = computed(() => items.value[0])
const products = computed(() => props.products.slice(0, 8))
const dropStoreLink = computed(() => props.drop.slug ? `/produtos?drop=${props.drop.slug}` : '/produtos')

function link(item?: DropVisualItem) { return item?.productSlug ? `/produto/${item.productSlug}` : '/produtos' }
function image(product: PublicProduct) { return product.mainImage || product.images?.[0] || '' }
function price(product: PublicProduct) { return formatCurrency(product.promotionalPrice || product.salePrice) }

function updateHorizontal() {
  if (!import.meta.client || prefersReducedMotion.value) return
  const stage = stageRef.value
  const track = trackRef.value
  if (!stage || !track) return
  if (window.innerWidth < 760) {
    stage.style.setProperty('--corridor-progress', '0')
    stage.style.setProperty('--corridor-x', '0px')
    return
  }
  const rect = stage.getBoundingClientRect()
  const distance = Math.max(track.scrollWidth - window.innerWidth + 120, 0)
  const total = Math.max(stage.offsetHeight - window.innerHeight, 1)
  const progress = Math.min(Math.max(-rect.top / total, 0), 1)
  stage.style.setProperty('--corridor-progress', progress.toFixed(4))
  stage.style.setProperty('--corridor-x', `${(-distance * progress).toFixed(2)}px`)
}

onMounted(() => {
  if (!import.meta.client) return
  updateHorizontal()
  window.addEventListener('scroll', updateHorizontal, { passive: true })
  window.addEventListener('resize', updateHorizontal, { passive: true })
  window.__edificioLenis?.on?.('scroll', updateHorizontal)
  requestAnimationFrame(resizeLenis)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', updateHorizontal)
  window.removeEventListener('resize', updateHorizontal)
  window.__edificioLenis?.off?.('scroll', updateHorizontal)
})
</script>

<template>
  <main ref="rootRef" class="e-drop-template e-corridor-template" :class="{ ready: campaignReady }">
    <section class="e-corridor-intro">
      <div class="e-container e-corridor-intro-grid">
        <div class="e-corridor-copy">
          <span class="e-kicker">{{ drop.shortLabel || 'corredor editorial' }}</span>
          <h1>{{ drop.title }}</h1>
          <p>{{ drop.description }}</p>
          <div class="e-campaign-actions">
            <NuxtLink :to="dropStoreLink" class="e-button-acid">Ver o drop</NuxtLink>
            <NuxtLink to="/produtos" class="e-button-secondary">Ver produtos</NuxtLink>
            <button class="e-button-secondary" type="button" @click="scrollTo('#corredor')">Entrar no corredor</button>
          </div>
        </div>
        <NuxtLink :to="link(heroItem)" class="e-corridor-poster">
          <img v-if="heroItem" :src="heroItem.image" :alt="heroItem.alt" loading="eager" @load="resizeLenis">
          <div v-else class="e-product-visual-fallback">118</div>
        </NuxtLink>
      </div>
    </section>

    <section id="corredor" ref="stageRef" class="e-corridor-stage">
      <div class="e-corridor-pin">
        <div class="e-corridor-fixed">
          <strong>corredor do drop</strong>
        </div>
        <div ref="trackRef" class="e-corridor-track">
          <NuxtLink v-for="(item, index) in items" :key="`${item.image}-${index}`" :to="link(item)" class="e-corridor-frame">
            <img :src="item.image" :alt="item.alt" :loading="index < 2 ? 'eager' : 'lazy'" @load="resizeLenis">
            <span>{{ item.productName }}</span>
          </NuxtLink>
          <article v-if="!items.length" class="e-corridor-frame is-text">
            <strong>Sem produto vinculado ainda.</strong>
            <NuxtLink to="/produtos" class="e-button-acid">Ver produtos</NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="e-container e-corridor-products">
      <NuxtLink v-for="product in products" :key="product.id" :to="`/produto/${product.slug}`" class="e-corridor-product">
        <img v-if="image(product)" :src="image(product)" :alt="product.name" loading="lazy">
        <span>{{ product.category?.name || product.material?.name || 'Edificio 118' }}</span>
        <strong>{{ product.name }}</strong>
        <small>{{ price(product) }}</small>
      </NuxtLink>
    </section>
  </main>
</template>
