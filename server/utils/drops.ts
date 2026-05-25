import type { Prisma } from '@prisma/client'
import type { DropLayoutModel, PublicDrop } from '~~/shared/types/drop'
import { prisma } from './prisma'
import { slugify } from './slug'

export const DEFAULT_DROP_HIGHLIGHT = '#D6FF2F'
export const DEFAULT_DROP_LAYOUT: DropLayoutModel = 'editorial-building'
export const VALID_DROP_LAYOUTS: DropLayoutModel[] = ['editorial-building', 'horizontal-corridor', 'immersive-manifesto', 'impact-zoom']

export const dropInclude = {
  _count: { select: { products: true } },
  products: {
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      mainImage: true,
      images: true,
      salePrice: true,
      promotionalPrice: true,
      stock: true,
      isActive: true,
      isPublished: true,
      dropId: true,
      category: { select: { id: true, name: true, slug: true } },
      material: { select: { id: true, name: true } }
    }
  }
} satisfies Prisma.DropInclude

export type DropWithCount = Prisma.DropGetPayload<{ include: typeof dropInclude }>

export function normalizeHighlightColor(value?: string | null) {
  return value && value.trim() ? value.trim() : DEFAULT_DROP_HIGHLIGHT
}

export function normalizeDropLayout(value?: string | null): DropLayoutModel {
  return VALID_DROP_LAYOUTS.includes(value as DropLayoutModel) ? (value as DropLayoutModel) : DEFAULT_DROP_LAYOUT
}

export function normalizeDropPhrases(value?: string[] | null) {
  return Array.from(new Set((value || []).map((phrase) => phrase.trim()).filter(Boolean))).slice(0, 18)
}

export function toPublicDrop(drop: DropWithCount): PublicDrop {
  return {
    id: drop.id,
    title: drop.title,
    slug: drop.slug,
    description: drop.description,
    shortLabel: drop.shortLabel,
    images: [],
    isActive: drop.isActive,
    isFeatured: drop.isFeatured,
    isDefault: Boolean((drop as unknown as { isDefault?: boolean }).isDefault),
    displayOrder: drop.displayOrder,
    buttonLabel: drop.buttonLabel,
    secondaryButtonLabel: drop.secondaryButtonLabel,
    storySectionTitle: drop.storySectionTitle,
    storySectionDescription: drop.storySectionDescription,
    highlightColor: normalizeHighlightColor(drop.highlightColor),
    layoutModel: normalizeDropLayout((drop as unknown as { layoutModel?: string }).layoutModel),
    dropPhrases: normalizeDropPhrases((drop as unknown as { dropPhrases?: string[] }).dropPhrases),
    productCount: drop._count.products,
    products: drop.products,
    createdAt: drop.createdAt,
    updatedAt: drop.updatedAt
  }
}

export async function makeUniqueDropSlug(nameOrSlug: string, ignoreId?: string) {
  const baseSlug = slugify(nameOrSlug) || 'drop'
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existing = await prisma.drop.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}
