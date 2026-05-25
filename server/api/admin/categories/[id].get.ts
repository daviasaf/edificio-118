import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da categoria não informado.' })

  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
  if (!category) throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada.' })
  return category
})
