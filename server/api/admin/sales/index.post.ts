import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { saleSchema } from '../../../validators/sale'
import { money, saleInclude } from '../../../utils/adminAnalytics'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const input = await readValidatedBody(event, saleSchema)
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { category: true }
  })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Produto escolhido para a venda não foi encontrado.' })
  }

  if (input.shouldDecreaseStock && product.stock < input.quantity) {
    throw createError({ statusCode: 400, statusMessage: 'Estoque insuficiente para baixar essa venda automaticamente.' })
  }

  const unitPrice = input.unitPrice ?? product.promotionalPrice ?? product.salePrice
  const unitCost = input.unitCost ?? product.costPrice ?? 0
  const totalRevenue = money(unitPrice * input.quantity - input.discount)
  const totalCost = money(unitCost * input.quantity)
  const estimatedProfit = money(totalRevenue - totalCost)

  if (totalRevenue < 0) {
    throw createError({ statusCode: 400, statusMessage: 'O desconto não pode ser maior que o total da venda.' })
  }

  const sale = await prisma.manualSale.create({
    data: {
      productId: input.productId,
      productNameSnapshot: product.name,
      categoryNameSnapshot: product.category?.name || null,
      soldAt: input.soldAt,
      quantity: input.quantity,
      unitPrice,
      unitCost,
      discount: input.discount,
      totalRevenue,
      totalCost,
      estimatedProfit,
      channel: input.channel,
      notes: input.notes,
      shouldDecreaseStock: input.shouldDecreaseStock
    },
    include: saleInclude
  })

  if (input.shouldDecreaseStock) {
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: { decrement: input.quantity } }
    })
  }

  return sale
})
