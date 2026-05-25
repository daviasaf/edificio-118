<script setup lang="ts">
import type { DropVisualItem, PublicDrop } from '~~/shared/types/drop'
import type { PublicProduct } from '~~/shared/types/product'
import { formatCurrency } from '~/utils/formatCurrency'

const props = defineProps<{
  drop: PublicDrop
  visualItems: DropVisualItem[]
  products: PublicProduct[]
  campaignReady?: boolean
}>()

const sectionRef = ref<HTMLElement | null>(null)
const runwayRef = ref<HTMLElement | null>(null)
const galleryRef = ref<HTMLElement | null>(null)
const { scrollTo, resizeLenis, prefersReducedMotion } = useDropScrollEffects(sectionRef)

const campaignItems = computed(() => props.visualItems.filter((item) => item.image))
const heroItem = computed(() => campaignItems.value[0])
const runwayProducts = computed(() => props.products.slice(0, 8))
const galleryItems = computed(() => campaignItems.value.slice(0, 12))
const hasProducts = computed(() => props.products.length > 0)
const hasImages = computed(() => campaignItems.value.some((item) => item.productSlug))
const phrases = computed(() => {
  const source = props.drop.dropPhrases?.length ? props.drop.dropPhrases : [
    'Nada aqui e so estampa.',
    'Cada peca tem uma fita.',
    'O corre tambem veste.'
  ]
  return Array.from(new Set(source.filter(Boolean))).slice(0, 8)
})

function productLink(item?: DropVisualItem) {
  return item?.productSlug ? `/produto/${item.productSlug}` : '/produtos'
}

const dropStoreLink = computed(() => props.drop.slug ? `/produtos?drop=${props.drop.slug}` : '/produtos')

function productImage(product: PublicProduct) {
  return product.mainImage || product.images?.[0] || ''
}

function productPrice(product: PublicProduct) {
  return formatCurrency(product.promotionalPrice || product.salePrice)
}

function itemPrice(item?: DropVisualItem) {
  return item?.price ? formatCurrency(item.price) : ''
}

function scrollToManifesto() {
  scrollTo('#manifesto')
}

function updateRunwayProgress() {
  if (!import.meta.client || prefersReducedMotion.value) return
  const element = runwayRef.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const total = Math.max(rect.height - window.innerHeight, 1)
  const progress = Math.min(Math.max((window.innerHeight - rect.top) / (total + window.innerHeight), 0), 1)
  element.style.setProperty('--runway-progress', progress.toFixed(4))
}

function updateGalleryDepth() {
  if (!import.meta.client || prefersReducedMotion.value) return
  const element = galleryRef.value
  if (!element) return
  const rect = element.getBoundingClientRect()
  const viewport = window.innerHeight || 1
  const progress = Math.min(Math.max((viewport - rect.top) / Math.max(rect.height + viewport, 1), 0), 1)
  element.style.setProperty('--gallery-progress', progress.toFixed(4))
}

function updateScrollState() {
  updateRunwayProgress()
  updateGalleryDepth()
}

onMounted(() => {
  if (!import.meta.client) return
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.__edificioLenis?.on?.('scroll', updateScrollState)
  requestAnimationFrame(resizeLenis)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', updateScrollState)
  window.__edificioLenis?.off?.('scroll', updateScrollState)
})
</script>

<template>
  <main ref="sectionRef" class="e-campaign" :class="{ ready: campaignReady, empty: !hasProducts }">
    <section class="e-campaign-hero">
      <div class="e-campaign-hero-bg" aria-hidden="true">
        <span>118</span>
        <i />
      </div>
      <div class="e-container e-campaign-hero-grid">
        <div class="e-campaign-hero-copy" data-reveal>
          <span class="e-kicker">{{ drop.shortLabel || 'campanha editorial' }}</span>
          <h1>{{ drop.title }}</h1>
          <p>{{ drop.description }}</p>
          <div class="e-campaign-actions">
            <NuxtLink :to="dropStoreLink" class="e-button-acid">Ver o drop</NuxtLink>
            <NuxtLink to="/produtos" class="e-button-secondary">Ver produtos</NuxtLink>
            <button class="e-button-secondary" type="button" @click="scrollToManifesto">
              {{ drop.secondaryButtonLabel || 'Ler manifesto' }}
            </button>
          </div>
        </div>

        <NuxtLink :to="productLink(heroItem)" class="e-campaign-hero-product" data-reveal>
          <template v-if="heroItem">
            <img :src="heroItem.image" :alt="heroItem.alt" loading="eager" @load="resizeLenis">
            <span>{{ heroItem.productName }}</span>
            <small v-if="itemPrice(heroItem)">{{ itemPrice(heroItem) }}</small>
          </template>
          <template v-else>
            <div class="e-campaign-fallback">
              <b>118</b>
              <span>campanha sem produto vinculado</span>
            </div>
          </template>
        </NuxtLink>
      </div>
    </section>

    <div class="e-campaign-marquee" aria-hidden="true">
      <div>
        <span v-for="i in 8" :key="i">
          <b v-for="phrase in phrases" :key="`${i}-${phrase}`">{{ phrase }}</b>
        </span>
      </div>
    </div>

    <section id="manifesto" class="e-campaign-manifesto">
      <div class="e-container e-campaign-manifesto-grid">
        <div data-reveal>
          <span class="e-kicker">manifesto</span>
          <h2>{{ drop.storySectionTitle || 'O Edificio e o que passa na cabeca de quem vive o corre.' }}</h2>
        </div>
        <div class="e-campaign-manifesto-text" data-reveal>
          <p>{{ drop.storySectionDescription || 'Nao e sobre parecer arrumado. E sobre parecer voce. Cada peca carrega uma cena, uma lembranca e uma vontade de sair diferente.' }}</p>
          <strong>{{ phrases[0] || 'Nada aqui e so estampa.' }}</strong>
        </div>
      </div>
    </section>

    <section ref="runwayRef" class="e-campaign-runway" :class="`count-${Math.min(runwayProducts.length, 4)}`">
      <div class="e-container e-campaign-section-head" data-reveal>
        <span class="e-kicker">runway do drop</span>
        <h2>Pecas que seguram a campanha.</h2>
        <NuxtLink to="/produtos" class="e-button-secondary">Ver catalogo</NuxtLink>
      </div>

      <div v-if="runwayProducts.length" class="e-runway-track">
        <NuxtLink
          v-for="(product, index) in runwayProducts"
          :key="product.id"
          :to="`/produto/${product.slug}`"
          class="e-runway-card"
          :style="{ '--runway-index': index }"
        >
          <div class="e-runway-image">
            <img
              v-if="productImage(product)"
              :src="productImage(product)"
              :alt="product.name"
              :loading="index < 2 ? 'eager' : 'lazy'"
              @load="resizeLenis"
            >
            <div v-else class="e-product-visual-fallback">118</div>
          </div>
          <span>{{ product.category?.name || product.material?.name || 'Edificio 118' }}</span>
          <strong>{{ product.name }}</strong>
          <small>{{ productPrice(product) }}</small>
        </NuxtLink>
      </div>

      <div v-else class="e-container">
        <div class="e-campaign-empty" data-reveal>
          <span>drop institucional</span>
          <strong>A campanha esta pronta para receber as proximas pecas.</strong>
          <NuxtLink to="/produtos" class="e-button-acid">Ver produtos</NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="hasImages" ref="galleryRef" class="e-campaign-gallery">
      <div class="e-container">
        <div class="e-campaign-section-head is-wide" data-reveal>
          <span class="e-kicker">galeria editorial</span>
          <h2>Imagem de produto, energia de campanha.</h2>
        </div>

        <div class="e-editorial-wall">
          <NuxtLink
            v-for="(item, index) in galleryItems"
            :key="`${item.image}-${index}`"
            :to="productLink(item)"
            class="e-editorial-wall-item"
            :class="`slot-${(index % 6) + 1}`"
          >
            <img :src="item.image" :alt="item.alt" loading="lazy" @load="resizeLenis">
            <span>{{ item.productName }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="e-campaign-close">
      <div class="e-container e-campaign-close-inner" data-reveal>
        <span class="e-kicker">entra no predio</span>
        <h2>{{ phrases[1] || 'A rua fala. A gente veste.' }}</h2>
        <p>{{ hasProducts ? 'Escolhe a peca que conversa contigo.' : 'Enquanto o proximo drop entra, o catalogo continua aberto.' }}</p>
        <NuxtLink to="/produtos" class="e-button-acid">Ver produtos</NuxtLink>
      </div>
    </section>
  </main>
</template>
