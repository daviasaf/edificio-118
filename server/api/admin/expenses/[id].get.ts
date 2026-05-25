import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { expenseInclude } from '../../../utils/adminAnalytics'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da despesa não informado.' })

  const expense = await prisma.expense.findUnique({ where: { id }, include: expenseInclude })
  if (!expense) throw createError({ statusCode: 404, statusMessage: 'Despesa não encontrada.' })
  return expense
})
