import { z } from 'zod'
import { slugify } from '../utils/slug'

export const DEFAULT_DROP_HIGHLIGHT = '#D6FF2F'
export const DROP_LAYOUT_MODELS = ['editorial-building', 'horizontal-corridor', 'immersive-manifesto', 'impact-zoom'] as const
export const DEFAULT_DROP_LAYOUT = 'editorial-building'

const colorRegex = /^(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*\))$/

function normalizeColor(value: string | null | undefined) {
  const color = (value || DEFAULT_DROP_HIGHLIGHT).trim()
  const shortHex = /^#([0-9a-fA-F]{3})$/.exec(color)
  if (shortHex) {
    const [r, g, b] = shortHex[1]!.split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  const longHex = /^#([0-9a-fA-F]{6})$/.exec(color)
  if (longHex) return `#${longHex[1]!.toUpperCase()}`
  return color
}

function normalizePhrase(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export const dropSchema = z.object({
  title: z.string().trim().min(2, 'Informe o título do drop.'),
  slug: z.string().trim().optional().default(''),
  description: z.string().trim().min(8, 'Informe uma descrição para o drop.'),
  shortLabel: z.string().trim().optional().nullable().default(''),
  images: z.array(z.string().trim()).max(32, 'Use no máximo 32 imagens no drop.').default([]),
  isActive: z.boolean().default(false),
  isDefault: z.boolean().optional().default(false),
  displayOrder: z.coerce.number().int().default(0),
  buttonLabel: z.string().trim().optional().nullable().default('Ver o drop'),
  secondaryButtonLabel: z.string().trim().optional().nullable().default('Entender a fita'),
  storySectionTitle: z.string().trim().optional().nullable().default(''),
  storySectionDescription: z.string().trim().optional().nullable().default(''),
  highlightColor: z.string().trim().optional().nullable().default(DEFAULT_DROP_HIGHLIGHT),
  layoutModel: z.enum(DROP_LAYOUT_MODELS).or(z.string().trim()).optional().default(DEFAULT_DROP_LAYOUT),
  dropPhrases: z.array(z.string().trim()).max(18, 'Use no máximo 18 frases curtas no drop.').optional().default([]),
  productIds: z.array(z.string().trim().min(1)).optional().default([])
}).superRefine((value, ctx) => {
  const color = value.highlightColor || DEFAULT_DROP_HIGHLIGHT
  if (!colorRegex.test(color.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['highlightColor'],
      message: 'Informe uma cor válida, como #D6FF2F ou rgb(214, 255, 47).'
    })
  }
}).transform((value) => {
  const images: string[] = []
  const dropPhrases = Array.from(new Set((value.dropPhrases || []).map(normalizePhrase).filter(Boolean))).slice(0, 18)

  return {
    ...value,
    slug: slugify(value.slug || value.title),
    shortLabel: value.shortLabel || null,
    images,
    dropPhrases,
    buttonLabel: value.buttonLabel || 'Ver o drop',
    secondaryButtonLabel: value.secondaryButtonLabel || 'Entender a fita',
    storySectionTitle: value.storySectionTitle || null,
    storySectionDescription: value.storySectionDescription || null,
    highlightColor: normalizeColor(value.highlightColor),
    layoutModel: DROP_LAYOUT_MODELS.includes(value.layoutModel as typeof DROP_LAYOUT_MODELS[number])
      ? value.layoutModel
      : DEFAULT_DROP_LAYOUT,
    productIds: Array.from(new Set(value.productIds || []))
  }
})

export const savedColorSchema = z.object({
  name: z.string().trim().optional().default(''),
  value: z.string().trim().min(1, 'Informe uma cor válida, como #D6FF2F.')
}).superRefine((value, ctx) => {
  if (!colorRegex.test(value.value.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'Informe uma cor válida, como #D6FF2F.'
    })
  }
}).transform((value) => ({
  name: value.name || `Cor ${normalizeColor(value.value)}`,
  value: normalizeColor(value.value)
}))
