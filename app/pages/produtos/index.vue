<script setup lang="ts">
import ProductCard from '~/components/shop/ProductCard.vue'
import SiteHeader from '~/components/shop/SiteHeader.vue'
import type { CategoryDTO } from '~~/shared/types/category'
import type { PublicDrop } from '~~/shared/types/drop'
import type { PublicProduct } from '~~/shared/types/product'

useSeoMeta({
  title: 'Drop — Edificio 118',
  description: 'Escolha sua peça do Edificio 118 e feche no WhatsApp.'
})

const route = useRoute()
const router = useRouter()

const q = ref('')
const selectedCategory = ref('')
const selectedSize = ref('')
const selectedColor = ref('')
const selectedDrop = ref(String(route.query.drop || ''))
const filtersOpen = ref(false)

const loading = ref(true)
const loadError = ref('')
const allProducts = ref<PublicProduct[]>([])
const categories = ref<CategoryDTO[]>([])
const drops = ref<PublicDrop[]>([])

function normalize(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

async function loadCatalog() {
  loading.value = true
  loadError.value = ''

  try {
    const [productsResponse, categoriesResponse, dropsResponse] = await Promise.all([
      $fetch<PublicProduct[]>('/api/shop/products'),
      $fetch<CategoryDTO[]>('/api/shop/categories'),
      $fetch<PublicDrop[]>('/api/shop/drops')
    ])

    allProducts.value = Array.isArray(productsResponse) ? productsResponse : []
    categories.value = Array.isArray(categoriesResponse) ? categoriesResponse : []
    drops.value = Array.isArray(dropsResponse) ? dropsResponse : []
  } catch (error) {
    console.error('[Edificio 118] Falha ao carregar catálogo público:', error)
    loadError.value = 'Não consegui carregar o catálogo agora. Abra /api/shop/products para conferir a resposta da API.'
    allProducts.value = []
  } finally {
    loading.value = false
  }
}

const products = computed(() => {
  const search = normalize(q.value)
  const category = normalize(selectedCategory.value)
  const size = normalize(selectedSize.value)
  const color = normalize(selectedColor.value)
  const drop = normalize(selectedDrop.value)

  return allProducts.value.filter((product) => {
    if (product.isActive === false || product.isPublished === false) return false

    if (drop && drop !== 'all' && normalize(product.drop?.slug) !== drop) return false
    if (category && normalize(product.category?.slug) !== category) return false

    if (size) {
      const sizes = (product.sizes || []).map((item) => normalize(item))
      if (!sizes.includes(size)) return false
    }

    if (color) {
      const colors = (product.colors || []).map((item) => normalize(item))
      if (!colors.includes(color)) return false
    }

    if (search) {
      const haystack = [
        product.name,
        product.slug,
        product.shortDescription,
        product.description,
        product.story || '',
        product.category?.name || '',
        product.drop?.title || ''
      ].join(' ').toLowerCase()

      if (!haystack.includes(search)) return false
    }

    return true
  })
})

const activeDrop = computed(() => drops.value.find((drop) => drop.slug === selectedDrop.value && !drop.isDefault) || null)
const hasFilters = computed(() => Boolean(q.value || selectedCategory.value || selectedSize.value || selectedColor.value || selectedDrop.value))
const sizes = computed(() => Array.from(new Set(allProducts.value.flatMap((product) => product.sizes || []))).filter(Boolean))
const colors = computed(() => Array.from(new Set(allProducts.value.flatMap((product) => product.colors || []))).filter(Boolean))
function syncDropQuery(drop: string) {
  const query = { ...route.query }
  if (drop && drop !== 'all') query.drop = drop
  else delete query.drop
  router.replace({ path: '/produtos', query })
}

watch(() => route.query.drop, (drop) => {
  const next = String(drop || '')
  if (next !== selectedDrop.value) selectedDrop.value = next
})

watch(selectedDrop, (drop) => {
  if (String(route.query.drop || '') !== drop) syncDropQuery(drop)
})

function clearFilters() {
  q.value = ''
  selectedCategory.value = ''
  selectedSize.value = ''
  selectedColor.value = ''
  selectedDrop.value = ''
  router.replace({ path: '/produtos', query: {} })
}

function clearDropFilter() {
  selectedDrop.value = ''
  router.replace({ path: '/produtos', query: {} })
}


function openRandomProduct() {
  const source = products.value.length ? products.value : allProducts.value
  if (!source.length) return
  const chosen = source[Math.floor(Math.random() * source.length)]
  if (chosen?.slug) navigateTo(`/produto/${chosen.slug}`)
}

onMounted(() => {
  loadCatalog()
})
</script>

<template>
  <div>
    <SiteHeader />

    <section class="e-section e-products-hero pb-8">
      <div class="e-container">
        <span class="e-kicker">ver o drop</span>
        <h1 class="e-heading mt-5 max-w-5xl text-5xl sm:text-7xl lg:text-8xl">
          Peças feitas pra quem vive o corre.
        </h1>
        <p class="e-body-text mt-5 max-w-2xl text-lg">
          Filtra sem pressa. A peça certa geralmente parece que tava te esperando no andar errado.
        </p>
      </div>
    </section>

    <section class="pb-16">
      <div class="e-container">
        <div v-if="activeDrop" class="e-panel mb-5 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span class="e-kicker">drop selecionado</span>
            <h2 class="e-heading mt-2 text-2xl sm:text-3xl">{{ activeDrop.title }}</h2>
            <p class="e-body-text mt-1">{{ activeDrop.description }}</p>
          </div>
          <button class="e-button-ghost shrink-0" type="button" @click="clearDropFilter">Ver todas as peças</button>
        </div>

        <p v-if="loadError" class="e-empty mb-6">{{ loadError }}</p>

        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button class="e-button-secondary" type="button" @click="filtersOpen = !filtersOpen">
            {{ filtersOpen ? 'Fechar filtros' : 'Filtrar peças' }}
          </button>
          <button v-if="hasFilters" class="e-button-ghost" type="button" @click="clearFilters">Limpar filtros</button>
        </div>

        <div v-if="hasFilters" class="e-active-filter-chips mb-5">
          <button v-if="q" type="button" @click="q = ''">Busca: {{ q }} ×</button>
          <button v-if="selectedCategory" type="button" @click="selectedCategory = ''">Categoria ×</button>
          <button v-if="selectedDrop" type="button" @click="clearDropFilter">Drop ×</button>
          <button v-if="selectedSize" type="button" @click="selectedSize = ''">Tamanho: {{ selectedSize }} ×</button>
          <button v-if="selectedColor" type="button" @click="selectedColor = ''">Cor: {{ selectedColor }} ×</button>
        </div>

        <div v-show="filtersOpen" class="e-filter-bar mb-5">
          <div>
            <label class="e-label" for="search">Buscar peça</label>
            <input id="search" v-model="q" class="e-input" placeholder="Camiseta, moletom, fita...">
          </div>
          <div class="grid gap-3 sm:grid-cols-4">
            <div>
              <label class="e-label" for="category">Categoria</label>
              <select id="category" v-model="selectedCategory" class="e-select">
                <option value="">Todas</option>
                <option v-for="category in categories" :key="category.id" :value="category.slug">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="e-label" for="drop">Drop</label>
              <select id="drop" v-model="selectedDrop" class="e-select">
                <option value="">Todos</option>
                <option v-for="drop in drops.filter((item) => item.isActive || item.isDefault)" :key="drop.id" :value="drop.isDefault ? '' : drop.slug">
                  {{ drop.isDefault ? 'Todos / Drop padrão' : drop.title }}
                </option>
              </select>
            </div>
            <div>
              <label class="e-label" for="size">Tamanho</label>
              <select id="size" v-model="selectedSize" class="e-select">
                <option value="">Qualquer</option>
                <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
              </select>
            </div>
            <div>
              <label class="e-label" for="color">Cor/Fita</label>
              <select id="color" v-model="selectedColor" class="e-select">
                <option value="">Qualquer</option>
                <option v-for="color in colors" :key="color" :value="color">{{ color }}</option>
              </select>
            </div>
          </div>
          <div v-if="hasFilters" class="md:col-span-2">
            <button class="e-button-ghost" type="button" @click="clearFilters">
              Limpar filtros — deixar o prédio aberto
            </button>
            <button class="e-button-secondary mt-3" type="button" @click="filtersOpen = false">Aplicar e fechar</button>
          </div>
        </div>

        <div v-if="loading" class="e-product-grid">
          <div v-for="item in 8" :key="item" class="e-skeleton aspect-[4/5]" />
        </div>

        <div v-else-if="products.length" class="e-product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <div v-else class="e-empty">
          <h2 class="mb-2 text-2xl font-black tracking-[-0.04em] text-[var(--e-text)]">
            Essa fita não apareceu por aqui.
          </h2>
          <p>
            A API carregou {{ allProducts.length }} produto(s), mas nenhum passou pelos filtros atuais.
            Limpe os filtros ou confira se a peça está ativa e publicada.
          </p>
          <button v-if="hasFilters" class="e-button-acid mt-5" type="button" @click="clearFilters">
            Abrir tudo de novo
          </button>
        </div>
      </div>
    </section>

    <section class="e-section pt-0">
      <div class="e-container">
        <div class="e-catalog-random-footer">
          <div>
            <span class="e-kicker">não sabe qual escolher?</span>
            <h2 class="e-heading mt-3 text-4xl sm:text-6xl">Deixa o prédio escolher uma fita.</h2>
            <p class="e-body-text mt-4 max-w-2xl">
              Aperta e a gente te joga em uma peça aleatória do catálogo. Às vezes a peça certa aparece no susto.
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row md:flex-col">
            <button class="e-button-acid" type="button" :disabled="!allProducts.length" @click="openRandomProduct">
              Escolher uma peça aleatória
            </button>
            <button class="e-button-secondary" type="button" @click="clearFilters">
              Ver tudo sem filtro
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
