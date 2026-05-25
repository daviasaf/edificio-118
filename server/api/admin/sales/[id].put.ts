import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { saleSchema } from '../../../validators/sale'
import { money, saleInclude } from '../../../utils/adminAnalytics'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da venda não informado.' })

  const existing = await prisma.manualSale.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Venda não encontrada.' })

  const input = await readValidatedBody(event, saleSchema)
  const product = await prisma.product.findUnique({ where: { id: input.productId }, include: { category: true } })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Produto escolhido para a venda não foi encontrado.' })

  const sameProduct = existing.productId === input.productId
  const oldStockImpact = sameProduct && existing.shouldDecreaseStock ? existing.quantity : 0
  const newStockImpact = input.shouldDecreaseStock ? input.quantity : 0
  const delta = newStockImpact - oldStockImpact

  if (sameProduct && delta > 0 && product.stock < delta) {
    throw createError({ statusCode: 400, statusMessage: 'Estoque insuficiente para ajustar essa venda automaticamente.' })
  }

  if (!sameProduct && input.shouldDecreaseStock && product.stock < input.quantity) {
    throw createError({ statusCode: 400, statusMessage: 'Estoque insuficiente para ajustar essa venda automaticamente.' })
  }

  const unitPrice = input.unitPrice ?? product.promotionalPrice ?? product.salePrice
  const unitCost = input.unitCost ?? product.costPrice ?? 0
  const totalRevenue = money(unitPrice * input.quantity - input.discount)
  const totalCost = money(unitCost * input.quantity)
  const estimatedProfit = money(totalRevenue - totalCost)

  if (totalRevenue < 0) {
    throw createError({ statusCode: 400, statusMessage: 'O desconto não pode ser maior que o total da venda.' })
  }

  const sale = await prisma.manualSale.update({
    where: { id },
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

  if (sameProduct && delta !== 0) {
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: delta > 0 ? { decrement: delta } : { increment: Math.abs(delta) } }
    })
  }

  if (!sameProduct) {
    if (existing.shouldDecreaseStock) {
      await prisma.product.update({
        where: { id: existing.productId },
        data: { stock: { increment: existing.quantity } }
      }).catch(() => null)
    }

    if (input.shouldDecreaseStock) {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: input.quantity } }
      })
    }
  }

  return sale
})
