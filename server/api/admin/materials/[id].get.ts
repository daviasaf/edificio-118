import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do material não informado.' })

  const material = await prisma.material.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
  if (!material) throw createError({ statusCode: 404, statusMessage: 'Material não encontrado.' })
  return material
})
