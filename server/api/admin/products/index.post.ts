import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { productSchema } from '../../../validators/product'
import { calcProfit } from '../../../utils/profit'
import { makeUniqueProductSlug, validatePublishableProduct, productInclude } from '../../../utils/products'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const input = await readValidatedBody(event, productSchema)
  const slug = await makeUniqueProductSlug(input.slug || input.name)
  const money = calcProfit(input.costPrice, input.salePrice, input.promotionalPrice)

  validatePublishableProduct(input)

  return prisma.product.create({
    data: {
      ...input,
      slug,
      ...money
    },
    include: productInclude
  })
})
