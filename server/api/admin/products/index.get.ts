import type { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { productInclude } from '../../../utils/products'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)
  const search = String(query.q || '').trim()
  const status = String(query.status || '').trim()
  const categoryId = String(query.categoryId || '').trim()
  const dropId = String(query.dropId || '').trim()
  const lowStock = String(query.lowStock || '').trim() === 'true'

  const where: Prisma.ProductWhereInput = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
      { shortDescription: { contains: search } }
    ]
  }

  if (status === 'published') where.isPublished = true
  if (status === 'draft') where.isPublished = false
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false
  if (categoryId) where.categoryId = categoryId
  if (dropId) where.dropId = dropId
  if (lowStock) where.stock = { lte: 3 }

  return prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: [{ displayOrder: 'asc' }, { updatedAt: 'desc' }]
  })
})
