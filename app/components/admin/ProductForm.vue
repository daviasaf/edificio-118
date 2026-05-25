<script setup lang="ts">
import { z } from 'zod'
import { toErrorMessage } from '~/utils/error'
import { validateAdminForm } from '~/utils/adminValidation'
import type { AdminProduct } from '~~/shared/types/product'
import type { CategoryDTO } from '~~/shared/types/category'
import type { MaterialDTO } from '~~/shared/types/material'
import type { AdminDrop } from '~~/shared/types/drop'


const productClientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da peça.'),
  shortDescription: z.string().trim().min(8, 'Informe uma descrição curta mais clara.'),
  description: z.string().trim().min(12, 'Informe uma descrição completa.'),
  salePrice: z.coerce.number().positive('Preço de venda precisa ser maior que zero.'),
  promotionalPrice: z.number().nullable(),
  costPrice: z.number().nullable(),
  stock: z.coerce.number().int().min(0, 'Estoque não pode ser negativo.'),
  images: z.array(z.string()).default([]),
  isPublished: z.boolean()
}).superRefine((value, ctx) => {
  if (value.promotionalPrice !== null && value.promotionalPrice >= value.salePrice) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['promotionalPrice'], message: 'Preço promocional precisa ser menor que o preço de venda.' })
  }

  if (value.isPublished && value.images.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['images'], message: 'Adicione pelo menos uma imagem antes de publicar o produto.' })
  }
})

const props = defineProps<{
  product?: AdminProduct | null
}>()

const emit = defineEmits<{
  saved: []
}>()

const categories = ref<CategoryDTO[]>([])
const materials = ref<MaterialDTO[]>([])
const drops = ref<AdminDrop[]>([])

async function loadOptions() {
  const [categoryData, materialData, dropData] = await Promise.all([
    $fetch<CategoryDTO[]>('/api/admin/categories').catch(() => []),
    $fetch<MaterialDTO[]>('/api/admin/materials').catch(() => []),
    $fetch<AdminDrop[]>('/api/admin/drops').catch(() => [])
  ])
  categories.value = categoryData
  materials.value = materialData
  drops.value = dropData
}

onMounted(loadOptions)

interface ProductFormState {
  name: string
  slug: string
  shortDescription: string
  description: string
  story: string
  materialNote: string
  salePrice: number
  promotionalPrice: number | null
  costPrice: number | null
  stock: number
  sizesText: string
  colorsText: string
  imagesText: string
  mainImage: string
  isActive: boolean
  isPublished: boolean
  isFeatured: boolean
  allowWhatsapp: boolean
  displayOrder: number
  categoryId: string
  materialId: string
  dropId: string
  internalNotes: string
}

const defaultState = (): ProductFormState => ({
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  story: '',
  materialNote: '',
  salePrice: 0,
  promotionalPrice: null,
  costPrice: null,
  stock: 0,
  sizesText: 'P, M, G, GG',
  colorsText: '',
  imagesText: '',
  mainImage: '',
  isActive: true,
  isPublished: false,
  isFeatured: false,
  allowWhatsapp: true,
  displayOrder: 0,
  categoryId: '',
  materialId: '',
  dropId: '',
  internalNotes: ''
})

const form = reactive<ProductFormState>(defaultState())
const saving = ref(false)
const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function hydrate(product?: AdminProduct | null) {
  Object.assign(form, defaultState())
  if (!product) return

  form.name = product.name
  form.slug = slugifyInput(product.name)
  form.shortDescription = product.shortDescription
  form.description = product.description
  form.story = product.story || ''
  form.materialNote = product.materialNote || ''
  form.salePrice = product.salePrice
  form.promotionalPrice = product.promotionalPrice ?? null
  form.costPrice = product.costPrice ?? null
  form.stock = product.stock
  form.sizesText = product.sizes.join(', ')
  form.colorsText = product.colors.join(', ')
  form.imagesText = product.images.join('\n')
  form.mainImage = product.mainImage || ''
  form.isActive = product.isActive
  form.isPublished = product.isPublished
  form.isFeatured = product.isFeatured
  form.allowWhatsapp = product.allowWhatsapp
  form.displayOrder = product.displayOrder
  form.categoryId = product.categoryId || ''
  form.materialId = product.materialId || ''
  form.dropId = product.dropId || product.drop?.id || ''
  form.internalNotes = product.internalNotes || ''
}

hydrate(props.product)
watch(() => props.product, hydrate)

watch(() => form.name, (name) => {
  form.slug = slugifyInput(name)
})

const images = computed(() => splitList(form.imagesText))

const productImages = computed({
  get: () => images.value,
  set: (value: string[]) => {
    form.imagesText = joinList(value)
    if (!form.mainImage || !value.includes(form.mainImage)) form.mainImage = value[0] || ''
  }
})
const estimatedProfit = computed(() => {
  const price = Number(form.promotionalPrice || form.salePrice || 0)
  const cost = Number(form.costPrice || 0)
  return Math.round((price - cost) * 100) / 100
})

function slugifyInput(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(value: string) {
  return Array.from(new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)))
}

function joinList(items: string[]) {
  return Array.from(new Set(items.filter(Boolean))).join('\n')
}


function brl(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function payload() {
  const imageList = splitList(form.imagesText)
  return {
    name: form.name,
    slug: slugifyInput(form.name),
    shortDescription: form.shortDescription,
    description: form.description,
    story: form.story,
    materialNote: form.materialNote,
    salePrice: Number(form.salePrice),
    promotionalPrice: form.promotionalPrice === null || form.promotionalPrice === undefined ? null : Number(form.promotionalPrice),
    costPrice: form.costPrice === null || form.costPrice === undefined ? null : Number(form.costPrice),
    stock: Number(form.stock),
    sizes: splitList(form.sizesText),
    colors: splitList(form.colorsText),
    images: imageList,
    mainImage: form.mainImage || imageList[0] || '',
    isActive: true,
    isPublished: form.isPublished,
    isFeatured: false,
    allowWhatsapp: true,
    displayOrder: Number(form.displayOrder),
    categoryId: form.categoryId || null,
    materialId: form.materialId || null,
    dropId: form.dropId || null,
    internalNotes: form.internalNotes
  }
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const body = payload()
  const validation = validateAdminForm(productClientSchema, body)
  if (!validation.success) {
    errorMessage.value = validation.message
    saving.value = false
    return
  }

  try {
    if (props.product?.id) {
      await $fetch(`/api/admin/products/${props.product.id}`, { method: 'PUT', body })
      successMessage.value = 'Produto atualizado com segurança.'
      await navigateTo('/admin/produtos')
    } else {
      await $fetch<AdminProduct>('/api/admin/products', { method: 'POST', body })
      successMessage.value = 'Produto criado. Agora ele já pode virar drop.'
      await navigateTo('/admin/produtos')
    }
    emit('saved')
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  } finally {
    saving.value = false
  }
}

async function uploadSelectedImages(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return

  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
  const maxSize = 5 * 1024 * 1024
  const uploadedImages: string[] = []
  const failed: string[] = []

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      failed.push(`${file.name}: tipo inválido`)
      continue
    }

    if (file.size > maxSize) {
      failed.push(`${file.name}: maior que 5MB`)
      continue
    }

    const body = new FormData()
    body.append('images', file)

    try {
      const response = await $fetch<{ images: string[] }>('/api/admin/uploads/products', {
        method: 'POST',
        body
      })
      uploadedImages.push(...response.images)
    } catch (error) {
      failed.push(`${file.name}: ${toErrorMessage(error, 'falhou ao enviar')}`)
    }
  }

  if (uploadedImages.length) {
    const current = splitList(form.imagesText)
    form.imagesText = joinList([...current, ...uploadedImages])
    if (!form.mainImage && uploadedImages[0]) form.mainImage = uploadedImages[0]
    successMessage.value = uploadedImages.length === 1 ? 'Imagem enviada automaticamente.' : `${uploadedImages.length} imagens enviadas automaticamente.`
  }

  if (failed.length) {
    errorMessage.value = `Algumas imagens não subiram: ${failed.join(' | ')}`
  }

  input.value = ''
  uploading.value = false
}

function removeImage(image: string) {
  const next = images.value.filter((item) => item !== image)
  form.imagesText = joinList(next)
  if (form.mainImage === image) form.mainImage = next[0] || ''
}
</script>

<template>
  <form class="grid gap-5" @submit.prevent="save">
    <p v-if="errorMessage" class="e-admin-alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="e-admin-success">{{ successMessage }}</p>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div>
          <p class="e-admin-eyebrow">01</p>
          <h2>Informações principais</h2>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-[1fr_0.7fr]">
        <div>
          <label class="e-admin-label" for="name">Nome da peça</label>
          <input id="name" v-model="form.name" class="e-admin-input" required>
        </div>
        <div>
          <p class="e-admin-label">Slug automático</p>
          <div class="e-admin-readonly-pill">/{{ form.slug || 'nome-da-peca' }}</div>
          <p class="e-admin-help">Gerado automaticamente pelo nome da peça.</p>
        </div>
      </div>
      <div class="mt-4">
        <label class="e-admin-label" for="shortDescription">Descrição curta</label>
        <input id="shortDescription" v-model="form.shortDescription" class="e-admin-input" required>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label class="e-admin-label" for="description">Descrição completa</label>
          <textarea id="description" v-model="form.description" class="e-admin-textarea min-h-36" required />
        </div>
        <div>
          <label class="e-admin-label" for="story">Significado / história da estampa</label>
          <textarea id="story" v-model="form.story" class="e-admin-textarea min-h-36" placeholder="Baseado em vivências reais..." />
        </div>
      </div>
    </section>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div>
          <p class="e-admin-eyebrow">02</p>
          <h2>Preço e estoque</h2>
        </div>
        <span class="e-admin-pill">Lucro estimado: {{ brl(estimatedProfit) }}</span>
      </div>
      <div class="grid gap-4 md:grid-cols-4">
        <div>
          <label class="e-admin-label" for="salePrice">Preço de venda</label>
          <input id="salePrice" v-model.number="form.salePrice" class="e-admin-input" type="number" min="0" step="0.01" required>
        </div>
        <div>
          <label class="e-admin-label" for="promotionalPrice">Promocional</label>
          <input id="promotionalPrice" v-model.number="form.promotionalPrice" class="e-admin-input" type="number" min="0" step="0.01">
        </div>
        <div>
          <label class="e-admin-label" for="costPrice">Custo interno</label>
          <input id="costPrice" v-model.number="form.costPrice" class="e-admin-input" type="number" min="0" step="0.01">
        </div>
        <div>
          <label class="e-admin-label" for="stock">Estoque</label>
          <input id="stock" v-model.number="form.stock" class="e-admin-input" type="number" min="0" step="1" required>
        </div>
      </div>
    </section>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div>
          <p class="e-admin-eyebrow">03</p>
          <h2>Organização da peça</h2>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="e-admin-label" for="sizes">Tamanhos</label>
          <input id="sizes" v-model="form.sizesText" class="e-admin-input" placeholder="PP, P, M, G, GG, Único">
          <p class="e-admin-help">Separe por vírgula. Pode escrever qualquer tamanho.</p>
        </div>
        <div>
          <label class="e-admin-label" for="colors">Cores/variações</label>
          <input id="colors" v-model="form.colorsText" class="e-admin-input" placeholder="Preto, Off-white, Vinho">
          <p class="e-admin-help">Separe por vírgula. Pode criar variações livres.</p>
        </div>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label class="e-admin-label" for="category">Categoria</label>
          <select id="category" v-model="form.categoryId" class="e-admin-select">
            <option value="">Sem categoria</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}{{ category.isActive ? '' : ' (inativa)' }}
            </option>
          </select>
        </div>
        <div>
          <label class="e-admin-label" for="material">Material</label>
          <select id="material" v-model="form.materialId" class="e-admin-select">
            <option value="">Sem material</option>
            <option v-for="material in materials" :key="material.id" :value="material.id">
              {{ material.name }}{{ material.isActive ? '' : ' (inativo)' }}
            </option>
          </select>
        </div>
        <div>
          <label class="e-admin-label" for="drop">Drop</label>
          <select id="drop" v-model="form.dropId" class="e-admin-select">
            <option value="">Sem drop</option>
            <option v-for="drop in drops" :key="drop.id" :value="drop.id">
              {{ drop.title }}{{ drop.isActive ? '' : ' (inativo)' }}
            </option>
          </select>
          <p class="e-admin-help">Produto sem drop aparece na loja geral.</p>
        </div>
      </div>
      <div class="mt-4">
        <label class="e-admin-label" for="materialNote">Nota de material</label>
        <input id="materialNote" v-model="form.materialNote" class="e-admin-input" placeholder="Algodão pesado, malha confortável...">
      </div>
    </section>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div>
          <p class="e-admin-eyebrow">04</p>
          <h2>Imagens</h2>
        </div>
        <span class="e-admin-pill">{{ images.length }} imagem(ns)</span>
      </div>
      <AdminImageUploader
        v-model="productImages"
        endpoint="/api/admin/uploads/products"
        :max="8"
        label="Adicionar imagens"
        @error="errorMessage = $event"
        @success="successMessage = $event"
      />

      <div v-if="images.length" class="mt-4">
        <label class="e-admin-label" for="mainImage">Imagem principal</label>
        <select id="mainImage" v-model="form.mainImage" class="e-admin-select">
          <option v-for="image in images" :key="image" :value="image">{{ image }}</option>
        </select>
      </div>

      <div class="mt-4">
        <label class="e-admin-label" for="images">URLs de imagens</label>
        <textarea id="images" v-model="form.imagesText" class="e-admin-textarea min-h-28" placeholder="Uma URL por linha" />
      </div>
    </section>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div>
          <p class="e-admin-eyebrow">05</p>
          <h2>Status de publicação</h2>
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label class="e-admin-check"><input v-model="form.isPublished" type="checkbox"> Publicado no site</label>
      </div>
      <p class="e-admin-help mt-3">Produto publicado precisa estar ativo, com estoque e com pelo menos uma imagem para aparecer bem no público.</p>
    </section>

    <section class="e-admin-card e-admin-form-section">
      <div class="e-admin-section-head compact">
        <div>
          <p class="e-admin-eyebrow">06</p>
          <h2>Dados internos</h2>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <label class="e-admin-label" for="displayOrder">Prioridade no catálogo</label>
          <input id="displayOrder" v-model.number="form.displayOrder" class="e-admin-input" type="number" step="1">
        <p class="e-admin-help">Número menor aparece primeiro no público.</p>
        </div>
        <div>
          <label class="e-admin-label" for="internalNotes">Observações internas</label>
          <input id="internalNotes" v-model="form.internalNotes" class="e-admin-input" placeholder="Não aparece no site público">
        </div>
      </div>
    </section>

    <div class="e-admin-actions-row">
      <NuxtLink to="/admin/produtos" class="e-admin-button secondary">Cancelar</NuxtLink>
      <button class="e-admin-button" type="submit" :disabled="saving">
        {{ saving ? 'Salvando...' : 'Salvar produto' }}
      </button>
    </div>
  </form>
</template>
