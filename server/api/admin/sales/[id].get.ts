import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { saleInclude } from '../../../utils/adminAnalytics'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da venda não informado.' })

  const sale = await prisma.manualSale.findUnique({ where: { id }, include: saleInclude })
  if (!sale) throw createError({ statusCode: 404, statusMessage: 'Venda não encontrada.' })
  return sale
})
