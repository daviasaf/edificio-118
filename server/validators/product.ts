import { z } from 'zod'
import { slugify } from '../utils/slug'

const emptyToNull = (value: unknown) => {
  if (value === '' || value === undefined) return null
  return value
}

const optionalMoney = z.preprocess(emptyToNull, z.coerce.number().min(0).nullable())
const optionalObjectId = z.preprocess(emptyToNull, z.string().trim().nullable())

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da peça.'),
  slug: z.string().trim().optional().default(''),
  shortDescription: z.string().trim().min(8, 'Informe uma descrição curta mais clara.'),
  description: z.string().trim().min(12, 'Informe uma descrição completa.'),
  story: z.string().trim().optional().nullable().default(''),
  materialNote: z.string().trim().optional().nullable().default(''),
  salePrice: z.coerce.number().positive('Preço de venda precisa ser maior que zero.'),
  promotionalPrice: optionalMoney,
  costPrice: optionalMoney,
  stock: z.coerce.number().int().min(0, 'Estoque não pode ser negativo.'),
  sizes: z.array(z.string().trim()).default([]),
  colors: z.array(z.string().trim()).default([]),
  images: z.array(z.string().trim()).default([]),
  mainImage: z.string().trim().optional().nullable().default(''),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  allowWhatsapp: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  categoryId: optionalObjectId,
  materialId: optionalObjectId,
  dropId: optionalObjectId,
  internalNotes: z.string().trim().optional().nullable().default('')
}).superRefine((value, ctx) => {
  if (value.promotionalPrice && value.promotionalPrice >= value.salePrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['promotionalPrice'],
      message: 'Preço promocional precisa ser menor que o preço de venda.'
    })
  }

  if (value.isPublished && value.images.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['images'],
      message: 'Produto publicado precisa ter pelo menos uma imagem.'
    })
  }
}).transform((value) => {
  const images = Array.from(new Set(value.images.filter(Boolean)))
  const mainImage = value.mainImage && images.includes(value.mainImage) ? value.mainImage : images[0] || null

  return {
    ...value,
    slug: slugify(value.slug || value.name),
    story: value.story || null,
    materialNote: value.materialNote || null,
    promotionalPrice: value.promotionalPrice || null,
    costPrice: value.costPrice || null,
    sizes: Array.from(new Set(value.sizes.map((item) => item.trim()).filter(Boolean))),
    colors: Array.from(new Set(value.colors.map((item) => item.trim()).filter(Boolean))),
    images,
    mainImage,
    categoryId: value.categoryId || null,
    materialId: value.materialId || null,
    dropId: value.dropId || null,
    internalNotes: value.internalNotes || null
  }
})