import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { buildExpenseWhere, endOfDay, expenseInclude, startOfDay } from '../../../utils/adminAnalytics'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const query = getQuery(event)
  const dateFrom = query.dateFrom ? startOfDay(new Date(String(query.dateFrom))) : undefined
  const dateTo = query.dateTo ? endOfDay(new Date(String(query.dateTo))) : undefined

  return prisma.expense.findMany({
    where: buildExpenseWhere({
      dateFrom,
      dateTo,
      productId: String(query.productId || '').trim() || undefined,
      category: String(query.category || '').trim() || undefined,
      expenseType: String(query.expenseType || '').trim() || undefined
    }),
    include: expenseInclude,
    orderBy: { spentAt: 'desc' }
  })
})
