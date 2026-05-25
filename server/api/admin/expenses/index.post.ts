import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { expenseSchema } from '../../../validators/expense'
import { expenseInclude } from '../../../utils/adminAnalytics'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const input = await readValidatedBody(event, expenseSchema)

  if (input.productId) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } })
    if (!product) throw createError({ statusCode: 404, statusMessage: 'Produto vinculado à despesa não foi encontrado.' })
  }

  return prisma.expense.create({ data: input, include: expenseInclude })
})
