<script setup lang="ts">
import { z } from 'zod'
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import { toErrorMessage } from '~/utils/error'
import { emitAdminToast, validateAdminForm } from '~/utils/adminValidation'
import type { AdminDrop, DropLayoutModel, SavedColorDTO } from '~~/shared/types/drop'
import type { AdminProduct } from '~~/shared/types/product'

const props = defineProps<{ drop?: AdminDrop | null }>()

const dropClientSchema = z.object({
  title: z.string().trim().min(2, 'Informe o titulo do drop.'),
  slug: z.string().trim().optional(),
  shortLabel: z.string().trim().optional(),
  description: z.string().trim().min(8, 'Informe uma descricao para o drop.'),
  isActive: z.boolean(),
  isDefault: z.boolean().optional(),
  displayOrder: z.coerce.number().int('Prioridade precisa ser um numero inteiro.'),
  buttonLabel: z.string().trim().optional(),
  secondaryButtonLabel: z.string().trim().optional(),
  storySectionTitle: z.string().trim().optional(),
  storySectionDescription: z.string().trim().optional(),
  highlightColor: z.string().trim().min(1, 'Informe uma cor valida, como #D6FF2F.'),
  layoutModel: z.enum(['editorial-building', 'horizontal-corridor', 'immersive-manifesto', 'impact-zoom']),
  dropPhrases: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional()
}).superRefine((value, ctx) => {
  if (!isValidColor(value.highlightColor)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['highlightColor'], message: 'Informe uma cor valida, como #D6FF2F.' })
  }
})

const sectionIds = ['01', '02', '03', '04']
const readyColors = [
  { name: 'Verde acido', value: '#D6FF2F' },
  { name: 'Vinho queimado', value: '#8E1B1B' },
  { name: 'Vermelho tijolo', value: '#B63A26' },
  { name: 'Off-white', value: '#F2EDE3' },
  { name: 'Amarelo palido', value: '#F5E663' },
  { name: 'Azul frio', value: '#60A5FA' },
  { name: 'Roxo urbano', value: '#A855F7' },
  { name: 'Laranja queimado', value: '#F97316' }
]

type LayoutOption = { value: DropLayoutModel; name: string; title: string; effect: string; description: string }

const layoutOptions: LayoutOption[] = [
  { value: 'editorial-building', name: 'Template 1', title: 'Editorial Hero', effect: 'Reveal, parallax leve, scrollTo e progress suave.', description: 'Abertura premium, segura e comercial para campanha principal.' },
  { value: 'horizontal-corridor', name: 'Template 2', title: 'Corredor Horizontal', effect: 'Sticky section com scroll vertical movendo uma travessia lateral.', description: 'Experiencia de corredor editorial, sem carrossel e sem autoplay.' },
  { value: 'immersive-manifesto', name: 'Template 3', title: 'Galeria / Manifesto', effect: 'Camadas, profundidade, velocity e composicao assimetrica.', description: 'Mais artistico, limpo e imersivo para drops com narrativa forte.' },
  { value: 'impact-zoom', name: 'Template 4', title: 'Sinal Brutalista', effect: 'Seções-poster, cards em trilho vertical e resposta visual a velocity/progress.', description: 'O mais ousado: campanha tech/editorial com blocos de impacto e atmosfera de sinal urbano.' }
]

const savedColors = ref<SavedColorDTO[]>([])
const productOptions = ref<AdminProduct[]>([])
const selectedProductIds = ref<string[]>([])
const stagedProductIds = ref<string[]>([])
const productModalOpen = ref(false)
const saving = ref(false)
const savingColor = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const newColorName = ref('')
const colorToDelete = ref<SavedColorDTO | null>(null)
const openSections = ref<Set<string>>(new Set(props.drop?.id ? [] : ['01']))

const form = reactive({
  title: '',
  slug: '',
  shortLabel: 'campanha editorial',
  description: '',
  isActive: false,
  isDefault: false,
  displayOrder: 0,
  buttonLabel: 'Ver produtos',
  secondaryButtonLabel: 'Ler manifesto',
  storySectionTitle: '',
  storySectionDescription: '',
  highlightColor: '#D6FF2F',
  layoutModel: 'editorial-building' as DropLayoutModel,
  dropPhrases: ['Nada aqui e so estampa.', 'Cada peca tem uma fita.', 'O corre tambem veste.'] as string[],
  phraseDraft: ''
})

const normalizedHighlight = computed(() => normalizeColor(form.highlightColor) || '#D6FF2F')
const automaticSlug = computed(() => slugifyInput(form.title) || 'nome-do-drop')
const colorIsValid = computed(() => isValidColor(form.highlightColor || '#D6FF2F'))
const linkedProducts = computed(() => productOptions.value.filter((product) => selectedProductIds.value.includes(product.id)))
const linkedImageCount = computed(() => linkedProducts.value.reduce((total, product) => {
  const images = new Set([product.mainImage, ...(product.images || [])].filter(Boolean) as string[])
  return total + images.size
}, 0))
const defaultLayout = layoutOptions[0] as LayoutOption
const selectedLayout = computed<LayoutOption>(() => layoutOptions.find((layout) => layout.value === form.layoutModel) || defaultLayout)

async function refreshSavedColors() {
  try { savedColors.value = await $fetch<SavedColorDTO[]>('/api/admin/saved-colors') } catch { savedColors.value = [] }
}

async function refreshProducts() {
  try {
    productOptions.value = await $fetch<AdminProduct[]>('/api/admin/products')
    syncSelectedProducts()
  } catch {
    productOptions.value = []
  }
}

onMounted(async () => {
  await Promise.all([refreshSavedColors(), refreshProducts()])
})

function slugifyInput(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function isValidColor(value: string) {
  const color = (value || '').trim()
  return /^(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*\))$/.test(color)
}

function normalizeColor(value: string) {
  const color = (value || '#D6FF2F').trim()
  const shortHex = /^#([0-9a-fA-F]{3})$/.exec(color)
  if (shortHex) {
    const [r, g, b] = shortHex[1]!.split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  const longHex = /^#([0-9a-fA-F]{6})$/.exec(color)
  if (longHex) return `#${longHex[1]!.toUpperCase()}`
  return color
}

function productImageCount(product: AdminProduct) {
  return new Set([product.mainImage, ...(product.images || [])].filter(Boolean) as string[]).size
}

function syncSelectedProducts(drop = props.drop) {
  const directProducts = ((drop?.products || []) as Array<{ id?: string }>).map((product) => product.id).filter(Boolean) as string[]
  if (directProducts.length) {
    selectedProductIds.value = directProducts
    return
  }

  if (drop?.id && productOptions.value.length) {
    selectedProductIds.value = productOptions.value.filter((product) => product.dropId === drop.id).map((product) => product.id)
    return
  }

  if (!drop?.id) selectedProductIds.value = selectedProductIds.value.filter((id) => productOptions.value.some((product) => product.id === id))
}

function hydrate(drop?: AdminDrop | null) {
  form.title = drop?.title || ''
  form.slug = drop?.slug || ''
  form.shortLabel = drop?.shortLabel || 'campanha editorial'
  form.description = drop?.description || ''
  form.isActive = drop?.isActive ?? false
  form.isDefault = Boolean(drop?.isDefault)
  form.displayOrder = drop?.displayOrder || 0
  form.buttonLabel = drop?.buttonLabel || 'Ver produtos'
  form.secondaryButtonLabel = drop?.secondaryButtonLabel || 'Ler manifesto'
  form.storySectionTitle = drop?.storySectionTitle || ''
  form.storySectionDescription = drop?.storySectionDescription || ''
  form.highlightColor = drop?.highlightColor || '#D6FF2F'
  form.layoutModel = layoutOptions.some((layout) => layout.value === drop?.layoutModel) ? drop!.layoutModel! : 'editorial-building'
  form.dropPhrases = [...(drop?.dropPhrases?.length ? drop.dropPhrases : ['Nada aqui e so estampa.', 'Cada peca tem uma fita.', 'O corre tambem veste.'])]
  syncSelectedProducts(drop)
}

hydrate(props.drop)
watch(() => props.drop, hydrate)
watch(() => productOptions.value.length, () => syncSelectedProducts())
watch(() => form.title, (title) => { form.slug = slugifyInput(title) })

function toggleSection(id: string) {
  const next = new Set(openSections.value)
  next.has(id) ? next.delete(id) : next.add(id)
  openSections.value = next
}

function sectionOpen(id: string) { return openSections.value.has(id) }
function sectionTitle(id: string) {
  if (id === '01') return 'Informacoes principais'
  if (id === '02') return 'Aparencia publica'
  if (id === '03') return 'Manifesto e botoes'
  return 'Produtos vinculados'
}
function sectionSummary(id: string) {
  if (id === '01') return form.title ? `${form.title} /${automaticSlug.value}` : 'Titulo, slug automatico e descricao'
  if (id === '02') return `${selectedLayout.value.title} ${normalizedHighlight.value}`
  if (id === '03') return `${form.dropPhrases.length} frase(s) curtas`
  return `${selectedProductIds.value.length} peca(s), ${linkedImageCount.value} imagem(ns)`
}

function setColor(value: string) { form.highlightColor = value }
function addDropPhrase() {
  const phrase = form.phraseDraft.trim().replace(/\s+/g, ' ')
  if (!phrase) return
  if (!form.dropPhrases.includes(phrase)) form.dropPhrases.push(phrase)
  form.phraseDraft = ''
}
function removeDropPhrase(index: number) { form.dropPhrases.splice(index, 1) }

function payload() {
  return {
    title: form.title,
    slug: automaticSlug.value === 'nome-do-drop' ? '' : automaticSlug.value,
    shortLabel: form.shortLabel,
    description: form.description,
    images: [],
    isActive: form.isActive,
    isDefault: form.isDefault,
    displayOrder: Number(form.displayOrder || 0),
    buttonLabel: form.buttonLabel,
    secondaryButtonLabel: form.secondaryButtonLabel,
    storySectionTitle: form.storySectionTitle,
    storySectionDescription: form.storySectionDescription,
    highlightColor: normalizeColor(form.highlightColor || '#D6FF2F'),
    layoutModel: form.layoutModel,
    dropPhrases: form.dropPhrases.map((phrase) => phrase.trim()).filter(Boolean),
    productIds: selectedProductIds.value
  }
}

function openProductModal() {
  stagedProductIds.value = [...selectedProductIds.value]
  productModalOpen.value = true
}
function toggleStagedProduct(productId: string) {
  stagedProductIds.value = stagedProductIds.value.includes(productId)
    ? stagedProductIds.value.filter((id) => id !== productId)
    : [...stagedProductIds.value, productId]
}
function applyProductSelection() {
  selectedProductIds.value = [...stagedProductIds.value]
  productModalOpen.value = false
  emitAdminToast('Pecas vinculadas atualizadas. Salve o drop para gravar.', 'info')
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (!colorIsValid.value) {
    errorMessage.value = 'Informe uma cor valida, como #D6FF2F.'
    emitAdminToast(errorMessage.value, 'error')
    saving.value = false
    return
  }

  const body = payload()
  const validation = validateAdminForm(dropClientSchema, body)
  if (!validation.success) {
    errorMessage.value = validation.message
    saving.value = false
    return
  }

  try {
    if (props.drop?.id) {
      await $fetch(`/api/admin/drops/${props.drop.id}`, { method: 'PUT', body })
      successMessage.value = 'Drop atualizado.'
    } else {
      await $fetch<AdminDrop>('/api/admin/drops', { method: 'POST', body })
      successMessage.value = 'Drop criado.'
    }
    await navigateTo('/admin/drops')
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  } finally {
    saving.value = false
  }
}

async function saveCustomColor() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!colorIsValid.value) {
    errorMessage.value = 'Informe uma cor valida, como #D6FF2F.'
    emitAdminToast(errorMessage.value, 'error')
    return
  }

  savingColor.value = true
  try {
    await $fetch('/api/admin/saved-colors', { method: 'POST', body: { name: newColorName.value || `Cor ${normalizedHighlight.value}`, value: normalizedHighlight.value } })
    newColorName.value = ''
    successMessage.value = 'Cor salva.'
    emitAdminToast('Cor salva.', 'success')
    await refreshSavedColors()
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  } finally {
    savingColor.value = false
  }
}

function requestRemoveSavedColor(color: SavedColorDTO) { colorToDelete.value = color }
async function confirmRemoveSavedColor() {
  if (!colorToDelete.value) return
  try {
    await $fetch(`/api/admin/saved-colors/${colorToDelete.value.id}`, { method: 'DELETE' })
    colorToDelete.value = null
    await refreshSavedColors()
    emitAdminToast('Cor removida.', 'success')
  } catch (error) {
    errorMessage.value = toErrorMessage(error)
  }
}
</script>

<template>
  <form class="grid gap-4" @submit.prevent="save">
    <p v-if="errorMessage" class="e-admin-alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="e-admin-success">{{ successMessage }}</p>

    <section v-for="section in sectionIds" :key="section" class="e-admin-card e-admin-collapse-card">
      <button class="e-admin-collapse-head" type="button" @click="toggleSection(section)">
        <span class="e-admin-eyebrow">{{ section }}</span>
        <strong>{{ sectionTitle(section) }}</strong>
        <small>{{ sectionSummary(section) }}</small>
        <span class="e-admin-collapse-arrow" :class="{ open: sectionOpen(section) }">v</span>
      </button>

      <div v-if="sectionOpen(section)" class="e-admin-collapse-body">
        <div v-if="section === '01'" class="e-drop-editor-info-grid">
          <div class="e-drop-editor-field">
            <label class="e-admin-label" for="drop-title">Titulo do drop</label>
            <input id="drop-title" v-model="form.title" class="e-admin-input" placeholder="Ex: Vivencia real" required>
          </div>
          <div class="e-drop-editor-field">
            <p class="e-admin-label">Slug automatico</p>
            <div class="e-admin-readonly-pill">/{{ automaticSlug }}</div>
            <p class="e-admin-help">Gerado automaticamente pelo titulo do drop.</p>
          </div>
          <div class="e-drop-editor-field">
            <label class="e-admin-label" for="drop-label">Selo curto</label>
            <input id="drop-label" v-model="form.shortLabel" class="e-admin-input" placeholder="campanha editorial">
          </div>
          <div class="e-drop-editor-field">
            <label class="e-admin-label" for="drop-description">Descricao publica</label>
            <textarea id="drop-description" v-model="form.description" class="e-admin-textarea e-drop-editor-textarea" placeholder="Explique a fita desse lancamento..." required />
          </div>
        </div>

        <div v-else-if="section === '02'" class="grid gap-5">
          <div class="grid gap-3">
            <div>
              <p class="e-admin-label">Template da home</p>
              <p class="e-admin-help">Escolha uma das 4 experiencias principais. Todas usam produtos vinculados, aceitam qualquer quantidade de pecas e nao exigem upload proprio de Drop.</p>
            </div>
            <div class="e-drop-layout-grid">
              <button
                v-for="layout in layoutOptions"
                :key="layout.value"
                class="e-drop-layout-card"
                :class="{ active: form.layoutModel === layout.value }"
                type="button"
                @click="form.layoutModel = layout.value"
              >
                <span class="e-admin-eyebrow">{{ layout.name }}</span>
                <strong>{{ layout.title }}</strong>
                <span class="e-drop-layout-mini" :class="`is-${layout.value}`">
                  <i /><i /><i /><i /><i /><i />
                </span>
                <small>{{ layout.effect }}</small>
                <em>{{ layout.description }}</em>
                <b v-if="form.layoutModel === layout.value">Selecionado</b>
              </button>
            </div>
          </div>

          <div class="e-drop-layout-preview" :class="`is-${form.layoutModel}`" :style="{ '--preview-color': normalizedHighlight }">
            <div>
              <span>{{ selectedLayout.name }} selecionado</span>
              <strong>{{ selectedLayout.title }}</strong>
              <p>{{ selectedLayout.description }}</p>
              <small>Efeito principal: {{ selectedLayout.effect }}</small>
              <small>Produtos vinculados: {{ selectedProductIds.length }} peca(s), {{ linkedImageCount }} imagem(ns). Sem minimo obrigatorio.</small>
            </div>
            <div class="e-drop-layout-preview-art">
              <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label class="e-admin-label" for="highlightColor">Cor de destaque</label>
              <input id="highlightColor" v-model="form.highlightColor" class="e-admin-input" placeholder="#D6FF2F ou rgb(214, 255, 47)">
            </div>
            <div class="flex items-end">
              <button class="e-admin-button secondary w-full" type="button" :disabled="savingColor || !colorIsValid" @click="saveCustomColor">{{ savingColor ? 'Salvando...' : 'Salvar cor' }}</button>
            </div>
          </div>
          <input v-model="newColorName" class="e-admin-input" placeholder="Nome opcional da cor. Ex: Vinho drop inverno">
          <p v-if="!colorIsValid" class="e-admin-alert">Informe uma cor valida, como #D6FF2F.</p>
          <div>
            <p class="e-admin-label">Cores prontas</p>
            <div class="e-color-picker-grid">
              <button v-for="color in readyColors" :key="color.value" class="e-color-chip" type="button" :class="{ active: normalizedHighlight === color.value }" @click="setColor(color.value)">
                <span :style="{ backgroundColor: color.value }" />{{ color.name }}
              </button>
            </div>
          </div>
          <div v-if="savedColors.length">
            <p class="e-admin-label">Cores salvas</p>
            <div class="e-saved-color-list">
              <article v-for="color in savedColors" :key="color.id" class="e-saved-color-card">
                <button type="button" class="e-saved-color-main" @click="setColor(color.value)">
                  <span :style="{ backgroundColor: color.value }" />
                  <strong>{{ color.name }}</strong>
                  <small>{{ color.value }}</small>
                </button>
                <button class="e-admin-button secondary" type="button" @click="requestRemoveSavedColor(color)">Excluir</button>
              </article>
            </div>
          </div>
        </div>

        <div v-else-if="section === '03'" class="grid gap-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="e-admin-label" for="drop-button">Botao principal</label>
              <input id="drop-button" v-model="form.buttonLabel" class="e-admin-input">
            </div>
            <div>
              <label class="e-admin-label" for="drop-secondary">Botao secundario</label>
              <input id="drop-secondary" v-model="form.secondaryButtonLabel" class="e-admin-input">
            </div>
          </div>
          <div>
            <label class="e-admin-label" for="story-title">Titulo do manifesto</label>
            <input id="story-title" v-model="form.storySectionTitle" class="e-admin-input" placeholder="Ex: O predio tambem guarda arquivo.">
          </div>
          <div>
            <label class="e-admin-label" for="story-description">Texto do manifesto</label>
            <textarea id="story-description" v-model="form.storySectionDescription" class="e-admin-textarea min-h-28" placeholder="Escreva o manifesto que acompanha esse drop..." />
          </div>
          <div class="grid gap-3">
            <label class="e-admin-label" for="drop-phrase">Frases curtas do drop</label>
            <div class="e-admin-inline-input">
              <input id="drop-phrase" v-model="form.phraseDraft" class="e-admin-input" placeholder="Ex: Nada aqui e so estampa." @keydown.enter.prevent="addDropPhrase">
              <button class="e-admin-button secondary" type="button" @click="addDropPhrase">Adicionar</button>
            </div>
            <div v-if="form.dropPhrases.length" class="e-admin-chip-list">
              <button v-for="(phrase, index) in form.dropPhrases" :key="`${phrase}-${index}`" class="e-admin-chip" type="button" @click="removeDropPhrase(index)">
                {{ phrase }} <span>x</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="grid gap-3">
          <div class="e-admin-actions-row justify-between">
            <p class="e-admin-help">Vincule as pecas do drop. A campanha visual da home usa product.mainImage e product.images automaticamente, sem upload proprio de drop.</p>
            <button class="e-admin-button secondary" type="button" @click="openProductModal">Selecionar pecas</button>
          </div>
          <div v-if="linkedProducts.length" class="e-linked-product-grid">
            <article v-for="product in linkedProducts" :key="product.id" class="e-linked-product-card">
              <img :src="product.mainImage || product.images?.[0] || '/images/editorial/corre-com-nos.webp'" :alt="product.name">
              <div>
                <strong>{{ product.name }}</strong>
                <small>{{ product.isPublished ? 'Publicado' : 'Rascunho' }} - estoque {{ product.stock }} - {{ productImageCount(product) }} imagem(ns)</small>
              </div>
            </article>
          </div>
          <div v-else class="e-admin-empty">0 peca(s) nesse drop. Ainda assim ele pode ser salvo, ativado e exibido com fallback institucional.</div>
        </div>
      </div>
    </section>

    <div class="e-admin-actions-row">
      <NuxtLink to="/admin/drops" class="e-admin-button secondary">Cancelar</NuxtLink>
      <button class="e-admin-button" type="submit" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar drop' }}</button>
    </div>

    <Teleport to="body">
      <div v-if="productModalOpen" class="e-admin-modal-backdrop" @click.self="productModalOpen = false">
        <section class="e-admin-modal-card e-admin-modal-card-wide">
          <p class="e-admin-eyebrow">Produtos vinculados</p>
          <h2>Selecionar pecas do drop</h2>
          <p>Marque qualquer quantidade de pecas. Depois clique em aplicar e salve o drop.</p>
          <div class="e-product-picker-list">
            <label v-for="product in productOptions" :key="product.id" class="e-product-picker-item">
              <input :checked="stagedProductIds.includes(product.id)" type="checkbox" @change="toggleStagedProduct(product.id)">
              <img :src="product.mainImage || product.images?.[0] || '/images/editorial/corre-com-nos.webp'" :alt="product.name">
              <span>
                <strong>{{ product.name }}</strong>
                <small>{{ product.isPublished ? 'Publicado' : 'Rascunho' }} - estoque {{ product.stock }} - {{ productImageCount(product) }} imagem(ns)</small>
              </span>
            </label>
          </div>
          <div v-if="!productOptions.length" class="e-admin-empty">Nenhum produto cadastrado ainda.</div>
          <div class="e-admin-actions-row mt-4">
            <button class="e-admin-button secondary" type="button" @click="productModalOpen = false">Cancelar</button>
            <button class="e-admin-button" type="button" @click="applyProductSelection">Aplicar selecao</button>
          </div>
        </section>
      </div>
    </Teleport>

    <AdminConfirmModal
      :open="Boolean(colorToDelete)"
      eyebrow="Excluir cor salva"
      title="Excluir esta cor?"
      :message="colorToDelete ? `A cor ${colorToDelete.name} sera removida da paleta salva.` : ''"
      confirm-label="Excluir cor"
      tone="danger"
      @update:open="(value) => { if (!value) colorToDelete = null }"
      @confirm="confirmRemoveSavedColor"
    />
  </form>
</template>
