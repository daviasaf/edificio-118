import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { dropSchema } from '../../../validators/drop'
import { makeUniqueDropSlug, dropInclude, toPublicDrop } from '../../../utils/drops'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const input = await readValidatedBody(event, dropSchema)
  const { productIds, ...dropData } = input
  const slug = await makeUniqueDropSlug(dropData.slug || dropData.title)

  if (dropData.isDefault) {
    await prisma.drop.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
  }

  if (dropData.isActive) {
    await prisma.drop.updateMany({ where: { isActive: true }, data: { isActive: false } })
  }

  const drop = await prisma.drop.create({ data: { ...dropData, slug }, include: dropInclude })

  if (productIds.length) {
    await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { dropId: drop.id } })
  }

  const updated = await prisma.drop.findUnique({ where: { id: drop.id }, include: dropInclude })
  return toPublicDrop(updated || drop)
})
