<script setup lang="ts">
import ProductCard from '~/components/shop/ProductCard.vue'
import SiteHeader from '~/components/shop/SiteHeader.vue'
import SiteFooter from '~/components/shop/SiteFooter.vue'
import type { PublicProduct } from '~~/shared/types/product'

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => String(route.params.slug || ''))

const { data, pending, error } = await useFetch<{ product: PublicProduct; related: PublicProduct[] }>(() => `/api/shop/products/${slug.value}`, {
  default: () => ({ product: {} as PublicProduct, related: [] })
})

const product = computed(() => data.value.product)
const related = computed(() => data.value.related)
const selectedImage = ref('')
const selectedSize = ref('')
const selectedColor = ref('')
const quantity = ref(1)
const validationMessage = ref('')

const images = computed(() => {
  const list = product.value.images?.length ? product.value.images : [product.value.mainImage || '/images/editorial/corre-com-nos.webp']
  return Array.from(new Set(list.filter(Boolean)))
})

const currentImage = computed(() => selectedImage.value || product.value.mainImage || images.value[0] || '/images/editorial/corre-com-nos.webp')
const price = computed(() => product.value.promotionalPrice || product.value.salePrice || 0)
const fullUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/, '')}${route.fullPath}`)

watch(
  product,
  (nextProduct) => {
    selectedImage.value = nextProduct.mainImage || nextProduct.images?.[0] || ''
    selectedSize.value = nextProduct.sizes?.length === 1 ? nextProduct.sizes[0] : ''
    selectedColor.value = nextProduct.colors?.length === 1 ? nextProduct.colors[0] : ''
  },
  { immediate: true }
)

function decrease() {
  quantity.value = Math.max(1, quantity.value - 1)
}

function increase() {
  quantity.value = Math.min(product.value.stock || 1, quantity.value + 1)
}

function validatePurchase() {
  const item = product.value

  if (!item?.id) return 'Essa peça não carregou direito. Atualiza a página e tenta de novo.'
  if (!item.isPublished || !item.isActive) return 'Essa peça ainda não tá liberada pro corre.'
  if (!item.allowWhatsapp) return 'Essa peça não tá fechando pelo WhatsApp agora.'
  if (item.stock <= 0) return 'Essa peça saiu do prédio por enquanto.'
  if (item.sizes?.length && !selectedSize.value) return 'Escolhe um tamanho antes de chamar no zap.'
  if (item.colors?.length && !selectedColor.value) return 'Escolhe a cor/variação antes de fechar.'
  if (!Number.isInteger(quantity.value) || quantity.value < 1) return 'A quantidade precisa ser pelo menos 1.'
  if (quantity.value > item.stock) return 'Essa quantidade passa do estoque disponível.'

  return ''
}

function openWhatsapp() {
  const message = validatePurchase()
  validationMessage.value = message

  if (message) return

  const href = buildWhatsAppLink({
    product: product.value,
    size: selectedSize.value || 'Sem tamanho definido',
    color: selectedColor.value || 'Sem variação definida',
    quantity: quantity.value,
    productUrl: fullUrl.value,
    whatsappNumber: String(config.public.whatsappNumber)
  })

  window.open(href, '_blank', 'noopener,noreferrer')
}

useSeoMeta({
  title: () => product.value?.name ? `${product.value.name} — Edificio 118` : 'Peça — Edificio 118',
  description: () => product.value?.shortDescription || 'Peça autoral do Edificio 118.'
})
</script>

<template>
  <div>
    <SiteHeader />

    <section class="e-section">
      <div class="e-container">
        <NuxtLink to="/produtos" class="e-back-to-products">← Voltar para produtos</NuxtLink>
        <div v-if="pending" class="e-product-page">
          <div class="e-skeleton aspect-[4/5]" />
          <div class="grid gap-4">
            <div class="e-skeleton h-16" />
            <div class="e-skeleton h-36" />
            <div class="e-skeleton h-14" />
          </div>
        </div>

        <div v-else-if="error || !product?.id" class="e-empty">
          <h1 class="mb-2 text-3xl font-black tracking-[-0.05em] text-[var(--e-text)]">
            Essa peça não apareceu no andar certo.
          </h1>
          <p>Volta pro drop e tenta outra fita.</p>
          <NuxtLink to="/produtos" class="e-button-acid mt-5">Voltar pro drop</NuxtLink>
        </div>

        <div v-else class="e-product-page">
          <div data-reveal>
            <div class="e-gallery-main">
              <img :src="currentImage" :alt="product.name">
            </div>
            <div v-if="images.length > 1" class="e-gallery-thumbs">
              <button
                v-for="image in images"
                :key="image"
                :class="['e-gallery-thumb', currentImage === image ? 'active' : '']"
                type="button"
                @click="selectedImage = image"
              >
                <img class="h-full w-full object-cover" :src="image" :alt="`Foto de ${product.name}`" loading="lazy">
              </button>
            </div>
          </div>

          <div data-reveal>
            <div class="mb-4 flex flex-wrap items-center gap-2">
              <span class="e-kicker">{{ product.category?.name || 'peça do prédio' }}</span>
              <span v-if="product.stock > 0" class="e-stamp">{{ product.stock }} no estoque</span>
            </div>

            <h1 class="e-heading text-5xl sm:text-7xl">{{ product.name }}</h1>
            <p class="e-body-text mt-5 text-lg">{{ product.shortDescription }}</p>

            <div class="e-price mt-6 text-2xl">
              <strong>{{ formatCurrency(price) }}</strong>
              <del v-if="product.promotionalPrice">{{ formatCurrency(product.salePrice) }}</del>
            </div>

            <div class="mt-8 grid gap-6">
              <div v-if="product.sizes?.length">
                <p class="e-label">Tamanho</p>
                <div class="e-choice-grid">
                  <button
                    v-for="size in product.sizes"
                    :key="size"
                    :class="['e-choice', selectedSize === size ? 'active' : '']"
                    type="button"
                    @click="selectedSize = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <div v-if="product.colors?.length">
                <p class="e-label">Cor/Variação</p>
                <div class="e-choice-grid">
                  <button
                    v-for="color in product.colors"
                    :key="color"
                    :class="['e-choice', selectedColor === color ? 'active' : '']"
                    type="button"
                    @click="selectedColor = color"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>

              <div>
                <p class="e-label">Quantidade</p>
                <div class="e-quantity">
                  <button type="button" aria-label="Diminuir quantidade" @click="decrease">−</button>
                  <span>{{ quantity }}</span>
                  <button type="button" aria-label="Aumentar quantidade" @click="increase">+</button>
                </div>
              </div>

              <div v-if="validationMessage" class="e-alert">{{ validationMessage }}</div>

              <button class="e-button-acid w-full" type="button" @click="openWhatsapp">
                Quero essa aqui
              </button>
            </div>

            <div class="e-panel mt-8 rounded-2xl p-5">
              <span class="e-stamp">a fita por trás</span>
              <p class="e-body-text mt-4 text-base">
                {{ product.story || product.description }}
              </p>
              <p v-if="product.materialNote" class="mt-5 text-sm font-bold text-[var(--e-muted)]">
                Material: {{ product.materialNote }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="related.length" class="e-section pt-0">
      <div class="e-container">
        <div class="mb-7">
          <span class="e-kicker">sugestões do prédio</span>
          <h2 class="e-heading mt-4 text-5xl sm:text-7xl">Talvez essa também bata.</h2>
        </div>
        <div class="e-product-grid">
          <ProductCard v-for="item in related" :key="item.id" :product="item" />
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
