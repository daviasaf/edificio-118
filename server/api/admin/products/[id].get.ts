import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { productInclude } from '../../../utils/products'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do produto não informado.' })
  }

  const product = await prisma.product.findUnique({ where: { id }, include: productInclude })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })
  }

  return product
})