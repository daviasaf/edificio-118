<script setup lang="ts">
import type { DropVisualItem, PublicDrop } from '~~/shared/types/drop'
import type { PublicProduct } from '~~/shared/types/product'

const props = defineProps<{ drop: PublicDrop; visualItems: DropVisualItem[]; products: PublicProduct[]; campaignReady?: boolean }>()
const rootRef = ref<HTMLElement | null>(null)
const { scrollTo, resizeLenis } = useDropScrollEffects(rootRef)
const items = computed(() => props.visualItems.filter((item) => item.image).slice(0, 9))
const phrases = computed(() => props.drop.dropPhrases?.length ? props.drop.dropPhrases.slice(0, 4) : ['Nada aqui e so estampa.', 'A cidade fala.', 'A gente veste.'])
const dropStoreLink = computed(() => props.drop.slug ? `/produtos?drop=${props.drop.slug}` : '/produtos')
function link(item?: DropVisualItem) { return item?.productSlug ? `/produto/${item.productSlug}` : '/produtos' }
</script>

<template>
  <main ref="rootRef" class="e-drop-template e-manifest-template" :class="{ ready: campaignReady }">
    <section class="e-manifest-hero">
      <div class="e-container">
        <span class="e-kicker">{{ drop.shortLabel || 'manifesto imersivo' }}</span>
        <h1>{{ drop.storySectionTitle || drop.title }}</h1>
        <p>{{ drop.storySectionDescription || drop.description }}</p>
        <div class="e-campaign-actions">
          <NuxtLink :to="dropStoreLink" class="e-button-acid">Ver o drop</NuxtLink>
          <NuxtLink to="/produtos" class="e-button-secondary">Ver produtos</NuxtLink>
          <button class="e-button-secondary" type="button" @click="scrollTo('#galeria-manifesto')">Ver galeria</button>
        </div>
      </div>
    </section>

    <section class="e-manifest-lines">
      <div class="e-container">
        <p v-for="phrase in phrases" :key="phrase">{{ phrase }}</p>
      </div>
    </section>

    <section id="galeria-manifesto" class="e-container e-manifest-wall">
      <NuxtLink v-for="(item, index) in items" :key="`${item.image}-${index}`" :to="link(item)" class="e-manifest-photo" :class="`slot-${(index % 6) + 1}`">
        <img :src="item.image" :alt="item.alt" :loading="index < 2 ? 'eager' : 'lazy'" @load="resizeLenis">
        <span>{{ item.productName }}</span>
      </NuxtLink>
      <article v-if="!items.length" class="e-campaign-empty">
        <span>campanha institucional</span>
        <strong>O manifesto entra mesmo antes das pecas.</strong>
        <NuxtLink to="/produtos" class="e-button-acid">Ver produtos</NuxtLink>
      </article>
    </section>
  </main>
</template>
