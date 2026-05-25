<script setup lang="ts">
import type { DropVisualItem, PublicDrop } from '~~/shared/types/drop'
import type { PublicProduct } from '~~/shared/types/product'
import { formatCurrency } from '~/utils/formatCurrency'

const props = defineProps<{ drop: PublicDrop; visualItems: DropVisualItem[]; products: PublicProduct[]; campaignReady?: boolean }>()
const rootRef = ref<HTMLElement | null>(null)
const { scrollTo, resizeLenis, prefersReducedMotion } = useDropScrollEffects(rootRef)
const products = computed(() => props.products.slice(0, 4))
const phrases = computed(() => props.drop.dropPhrases?.length ? props.drop.dropPhrases.slice(0, 3) : ['Rua em alta frequencia.', 'Produto como sinal.', 'Drop em estado bruto.'])
const dropStoreLink = computed(() => props.drop.slug ? `/produtos?drop=${props.drop.slug}` : '/produtos')

function image(product: PublicProduct) { return product.mainImage || product.images?.[0] || '' }
function price(product: PublicProduct) { return formatCurrency(product.promotionalPrice || product.salePrice) }

function updateSignal() {
  if (!import.meta.client || prefersReducedMotion.value) return
  const element = rootRef.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const viewport = window.innerHeight || 1
  const progress = Math.min(Math.max((viewport - rect.top) / Math.max(rect.height + viewport, 1), 0), 1)
  element.style.setProperty('--signal-progress', progress.toFixed(4))
}

onMounted(() => {
  if (!import.meta.client) return
  updateSignal()
  window.addEventListener('scroll', updateSignal, { passive: true })
  window.__edificioLenis?.on?.('scroll', updateSignal)
  requestAnimationFrame(resizeLenis)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', updateSignal)
  window.__edificioLenis?.off?.('scroll', updateSignal)
})
</script>

<template>
  <main ref="rootRef" class="e-drop-template e-signal-template" :class="{ ready: campaignReady }">
    <section class="e-signal-hero">
      <div class="e-container e-signal-hero-grid">
        <div>
          <span class="e-kicker">{{ drop.shortLabel || 'sinal brutalista' }}</span>
          <h1>{{ drop.title }}</h1>
          <p>{{ drop.description }}</p>
          <div class="e-campaign-actions">
            <NuxtLink :to="dropStoreLink" class="e-button-acid">Ver o drop</NuxtLink>
            <NuxtLink to="/produtos" class="e-button-secondary">Ver produtos</NuxtLink>
            <button class="e-button-secondary" type="button" @click="scrollTo('#sinal-produtos')">Ver peças</button>
          </div>
        </div>
        <div class="e-signal-phrase-stack" aria-hidden="true">
          <span v-for="phrase in phrases" :key="phrase">{{ phrase }}</span>
        </div>
      </div>
    </section>

    <section id="sinal-produtos" class="e-signal-products" :style="{ '--signal-accent': drop.highlightColor || '#D6FF2F' }">
      <div class="e-container">
        <h2>Produto, rua e presença em alto contraste.</h2>
        <div class="e-signal-product-grid">
          <NuxtLink v-for="product in products" :key="product.id" :to="`/produto/${product.slug}`" class="e-signal-product">
            <img v-if="image(product)" :src="image(product)" :alt="product.name" loading="lazy">
            <strong>{{ product.name }}</strong>
            <small>{{ price(product) }}</small>
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>
