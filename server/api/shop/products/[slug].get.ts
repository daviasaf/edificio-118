import type { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { productInclude, toPublicProduct } from '../../../utils/products'

function isVisibleProduct(product: { isActive?: boolean | null; isPublished?: boolean | null }) {
  return product.isActive !== false && product.isPublished !== false
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug do produto não informado.' })
  }

  const product = await prisma.product.findFirst({
    where: { slug },
    include: productInclude
  })

  if (!product || !isVisibleProduct(product)) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado ou indisponível.' })
  }

  const relatedOr: Prisma.ProductWhereInput[] = []

  if (product.categoryId) relatedOr.push({ categoryId: product.categoryId })
  if (product.materialId) relatedOr.push({ materialId: product.materialId })
  if (product.dropId) relatedOr.push({ dropId: product.dropId })

  const relatedRaw = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      ...(relatedOr.length ? { OR: relatedOr } : {})
    },
    include: productInclude,
    orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
    take: 8
  })

  let related = relatedRaw.filter(isVisibleProduct).slice(0, 4)

  if (related.length < 4) {
    const fallbackRaw = await prisma.product.findMany({
      where: { id: { not: product.id } },
      include: productInclude,
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { updatedAt: 'desc' }],
      take: 12
    })

    const seen = new Set(related.map((item) => item.id))
    const fallback = fallbackRaw
      .filter(isVisibleProduct)
      .filter((item) => !seen.has(item.id))
      .slice(0, 4 - related.length)

    related = [...related, ...fallback]
  }

  return {
    product: toPublicProduct(product),
    related: related.map(toPublicProduct)
  }
})
