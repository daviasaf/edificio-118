import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { productSchema } from '../../../validators/product'
import { calcProfit } from '../../../utils/profit'
import { makeUniqueProductSlug, productInclude, validatePublishableProduct } from '../../../utils/products'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do produto não informado.' })
  }

  const existing = await prisma.product.findUnique({ where: { id } })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })
  }

  const input = await readValidatedBody(event, productSchema)
  const slug = await makeUniqueProductSlug(input.slug || input.name, id)
  const money = calcProfit(input.costPrice, input.salePrice, input.promotionalPrice)

  validatePublishableProduct(input)

  return prisma.product.update({
    where: { id },
    data: {
      ...input,
      slug,
      ...money
    },
    include: productInclude
  })
})
