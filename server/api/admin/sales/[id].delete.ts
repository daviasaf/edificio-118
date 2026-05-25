import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID da venda não informado.' })

  const existing = await prisma.manualSale.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Venda não encontrada.' })

  await prisma.manualSale.delete({ where: { id } })

  if (existing.shouldDecreaseStock) {
    await prisma.product.update({
      where: { id: existing.productId },
      data: { stock: { increment: existing.quantity } }
    }).catch(() => null)
  }

  return { ok: true }
})
