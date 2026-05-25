import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do produto não informado.' })
  }

  const linkedSales = await prisma.manualSale.count({ where: { productId: id } })
  const linkedExpenses = await prisma.expense.count({ where: { productId: id } })

  if (linkedSales || linkedExpenses) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Esse produto tem vendas ou despesas vinculadas. Desative/despublique para preservar os relatórios.'
    })
  }

  await prisma.product.delete({ where: { id } })

  return { ok: true }
})
