import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { expenseSchema } from '../../../validators/expense'
import { expenseInclude } from '../../../utils/adminAnalytics'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da despesa não informado.' })

  const input = await readValidatedBody(event, expenseSchema)
  if (input.productId) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } })
    if (!product) throw createError({ statusCode: 404, statusMessage: 'Produto vinculado à despesa não foi encontrado.' })
  }

  return prisma.expense.update({ where: { id }, data: input, include: expenseInclude })
})
