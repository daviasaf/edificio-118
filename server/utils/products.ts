import type { Prisma } from '@prisma/client'
import type { PublicProduct } from '~~/shared/types/product'
import { prisma } from './prisma'
import { slugify } from './slug'

export const productInclude = {
  category: true,
  material: true,
  drop: true
} satisfies Prisma.ProductInclude

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>

export function toPublicProduct(product: ProductWithRelations): PublicProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    story: product.story,
    materialNote: product.materialNote,
    salePrice: product.salePrice,
    promotionalPrice: product.promotionalPrice,
    stock: product.stock,
    sizes: product.sizes,
    colors: product.colors,
    images: product.images,
    mainImage: product.mainImage,
    isActive: product.isActive,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    allowWhatsapp: product.allowWhatsapp,
    displayOrder: product.displayOrder,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description
        }
      : null,
    material: product.material
      ? {
          id: product.material.id,
          name: product.material.name,
          description: product.material.description
        }
      : null,
    drop: product.drop
      ? {
          id: product.drop.id,
          title: product.drop.title,
          slug: product.drop.slug,
          shortLabel: product.drop.shortLabel
        }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }
}

export async function makeUniqueProductSlug(nameOrSlug: string, ignoreId?: string) {
  const baseSlug = slugify(nameOrSlug) || 'produto'
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } })

    if (!existing || existing.id === ignoreId) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}

export function normalizeStringArray(value: string[] | undefined | null) {
  return Array.from(new Set((value || []).map((item) => item.trim()).filter(Boolean)))
}

export function validatePublishableProduct(input: { isPublished: boolean; images: string[]; stock: number }) {
  if (input.isPublished && input.images.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Produto publicado precisa ter pelo menos uma imagem.' })
  }

  if (input.isPublished && input.stock < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Estoque não pode ser negativo.' })
  }
}