<script setup lang="ts">
import DropCampaignLoader from '~/components/shop/drop-heroes/DropCampaignLoader.vue'
import EditorialBuilding from '~/components/shop/drop-heroes/EditorialBuilding.vue'
import HorizontalCorridor from '~/components/shop/drop-heroes/HorizontalCorridor.vue'
import ImmersiveManifesto from '~/components/shop/drop-heroes/ImmersiveManifesto.vue'
import ImpactZoom from '~/components/shop/drop-heroes/ImpactZoom.vue'
import SiteFooter from '~/components/shop/SiteFooter.vue'
import SiteHeader from '~/components/shop/SiteHeader.vue'
import type { DropLayoutModel, DropVisualItem, PublicDrop } from '~~/shared/types/drop'
import type { PublicProduct } from '~~/shared/types/product'
import { buildDropVisualItems } from '~/utils/dropVisualItems'

type LoaderState = 'loading' | 'ready' | 'entering' | 'finished' | 'error'

const fallbackDrop: PublicDrop = {
  id: 'fallback',
  title: 'O predio feito pra quem vive o corre.',
  slug: '',
  description: 'O Edificio 118 nasce do que acontece no dia a dia. Roupa com presenca, historia e rua.',
  shortLabel: 'campanha editorial',
  images: [],
  isActive: true,
  isFeatured: true,
  isDefault: true,
  displayOrder: 0,
  buttonLabel: 'Ver produtos',
  secondaryButtonLabel: 'Ler manifesto',
  storySectionTitle: 'O Edificio e o que passa na cabeca de quem vive o corre.',
  storySectionDescription: 'Nao e sobre parecer arrumado. E sobre parecer voce. Cada peca carrega uma cena, uma lembranca, um incomodo ou uma vontade de sair diferente.',
  highlightColor: '#D6FF2F',
  layoutModel: 'editorial-building',
  dropPhrases: ['Nada aqui e so estampa.', 'Cada peca tem uma fita.', 'O corre tambem veste.'],
  productCount: 0,
  products: []
}

const { data: featuredDrop } = await useFetch<PublicDrop>('/api/shop/drops/featured', {
  default: () => fallbackDrop
})

const drop = computed(() => featuredDrop.value || fallbackDrop)
const pageAccentStyle = computed(() => ({
  '--e-acid': drop.value.highlightColor || '#D6FF2F',
  '--drop-accent': drop.value.highlightColor || '#D6FF2F'
}))

const featuredProducts = computed<PublicProduct[]>(() => ((drop.value.products || []) as PublicProduct[])
  .filter((product) => product.isActive !== false && product.isPublished !== false))
const visualItems = computed<DropVisualItem[]>(() => buildDropVisualItems(drop.value, 28))
const loaderState = ref<LoaderState>('loading')
const loaderProgress = ref(6)
const campaignReady = computed(() => loaderState.value === 'finished')
const heroComponents: Record<DropLayoutModel, unknown> = {
  'editorial-building': EditorialBuilding,
  'horizontal-corridor': HorizontalCorridor,
  'immersive-manifesto': ImmersiveManifesto,
  'impact-zoom': ImpactZoom
}
const activeHeroComponent = computed(() => heroComponents[drop.value.layoutModel || 'editorial-building'] || EditorialBuilding)

function preloadImage(src: string, timeout = 2800) {
  return new Promise<boolean>((resolve) => {
    if (!import.meta.client || !src) return resolve(true)
    const image = new Image()
    let done = false
    const finish = (ok: boolean) => {
      if (done) return
      done = true
      resolve(ok)
    }
    image.onload = () => finish(true)
    image.onerror = () => finish(false)
    image.src = src
    window.setTimeout(() => finish(false), timeout)
  })
}

async function prepareCampaign() {
  if (!import.meta.client) return
  document.documentElement.classList.add('is-campaign-preparing')
  window.__edificioLenis?.stop?.()

  const criticalImages = Array.from(new Set(visualItems.value.slice(0, 6).map((item) => item.image).filter(Boolean)))
  const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, criticalImages.length ? 1100 : 900))
  const safetyTimeout = new Promise((resolve) => window.setTimeout(resolve, 4200))

  if (!criticalImages.length) {
    loaderProgress.value = 72
    await Promise.race([minimumDelay, safetyTimeout])
  } else {
    let loaded = 0
    await Promise.race([
      Promise.all(criticalImages.map(async (src) => {
        await preloadImage(src)
        loaded += 1
        loaderProgress.value = 14 + Math.round((loaded / criticalImages.length) * 72)
      })),
      safetyTimeout
    ])
    await minimumDelay
  }

  loaderProgress.value = 96
  await nextTick()
  window.__edificioLenis?.resize?.()
  loaderState.value = 'ready'
  loaderProgress.value = 100
  await new Promise((resolve) => window.setTimeout(resolve, 360))
  loaderState.value = 'entering'
  await new Promise((resolve) => window.setTimeout(resolve, 640))
  loaderState.value = 'finished'
  document.documentElement.classList.remove('is-campaign-preparing')
  window.__edificioLenis?.start?.()
  window.__edificioLenis?.resize?.()
}

onMounted(() => {
  loaderState.value = 'loading'
  loaderProgress.value = 6
  prepareCampaign().catch(() => {
    loaderState.value = 'error'
    window.setTimeout(() => {
      loaderState.value = 'finished'
      document.documentElement.classList.remove('is-campaign-preparing')
      window.__edificioLenis?.start?.()
      window.__edificioLenis?.resize?.()
    }, 500)
  })
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.documentElement.classList.remove('is-campaign-preparing')
  window.__edificioLenis?.start?.()
})
</script>

<template>
  <div class="e-public-scope" :style="pageAccentStyle">
    <DropCampaignLoader
      :drop-title="drop.title"
      :accent-color="drop.highlightColor || '#D6FF2F'"
      :progress="loaderProgress"
      :is-ready="loaderState === 'ready' || loaderState === 'entering'"
      :state="loaderState"
    />
    <SiteHeader />
    <component
      :is="activeHeroComponent"
      :drop="drop"
      :visual-items="visualItems"
      :products="featuredProducts"
      :campaign-ready="campaignReady"
    />
    <SiteFooter />
  </div>
</template>
