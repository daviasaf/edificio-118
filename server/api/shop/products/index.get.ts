import type { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { productInclude, toPublicProduct } from '../../../utils/products'

function normalize(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function isVisibleProduct(product: { isActive?: boolean | null; isPublished?: boolean | null }) {
  // True is the expected value. `!== false` keeps older MongoDB records from disappearing
  // if they were created before these booleans existed.
  return product.isActive !== false && product.isPublished !== false
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = normalize(query.q)
  const category = normalize(query.category)
  const size = normalize(query.size)
  const color = normalize(query.color)
  const featured = String(query.featured || '').trim() === 'true'
  const dropSlug = normalize(query.drop)

  const where: Prisma.ProductWhereInput = {}

  if (featured) where.isFeatured = true

  if (dropSlug && dropSlug !== 'all') {
    const targetDrop = await prisma.drop.findFirst({
      where: { slug: dropSlug, isDefault: { not: true }, isActive: { not: false } },
      select: { id: true }
    })

    if (!targetDrop) return []
    where.dropId = targetDrop.id
  }

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
  })

  const filtered = products.filter((product) => {
    if (!isVisibleProduct(product)) return false

    if (q) {
      const haystack = [product.name, product.shortDescription, product.description, product.story || '', product.slug]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }

    if (category && normalize(product.category?.slug) !== category) return false

    if (size) {
      const sizes = (product.sizes || []).map((item) => normalize(item))
      if (!sizes.includes(size)) return false
    }

    if (color) {
      const colors = (product.colors || []).map((item) => normalize(item))
      if (!colors.includes(color)) return false
    }

    return true
  })

  return filtered.map(toPublicProduct)
})
