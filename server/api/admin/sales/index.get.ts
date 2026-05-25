import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { buildSaleWhere, endOfDay, saleInclude, startOfDay } from '../../../utils/adminAnalytics'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const query = getQuery(event)
  const dateFrom = query.dateFrom ? startOfDay(new Date(String(query.dateFrom))) : undefined
  const dateTo = query.dateTo ? endOfDay(new Date(String(query.dateTo))) : undefined

  return prisma.manualSale.findMany({
    where: buildSaleWhere({
      dateFrom,
      dateTo,
      productId: String(query.productId || '').trim() || undefined,
      category: String(query.category || '').trim() || undefined,
      channel: String(query.channel || '').trim() || undefined
    }),
    include: saleInclude,
    orderBy: { soldAt: 'desc' }
  })
})
