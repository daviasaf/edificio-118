import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { dropSchema } from '../../../validators/drop'
import { makeUniqueDropSlug, dropInclude, toPublicDrop } from '../../../utils/drops'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do drop não informado.' })

  const existing = await prisma.drop.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Drop não encontrado.' })

  const input = await readValidatedBody(event, dropSchema)
  const { productIds, ...dropData } = input
  const slug = await makeUniqueDropSlug(dropData.slug || dropData.title, id)

  if (dropData.isDefault) {
    await prisma.drop.updateMany({ where: { isDefault: true, NOT: { id } }, data: { isDefault: false } })
  }

  if (dropData.isActive) {
    await prisma.drop.updateMany({ where: { isActive: true, NOT: { id } }, data: { isActive: false } })
  }

  await prisma.drop.update({ where: { id }, data: { ...dropData, slug } })

  await prisma.product.updateMany({ where: { dropId: id, id: { notIn: productIds } }, data: { dropId: null } })
  if (productIds.length) {
    await prisma.product.updateMany({ where: { id: { in: productIds } }, data: { dropId: id } })
  }

  const drop = await prisma.drop.findUnique({ where: { id }, include: dropInclude })
  if (!drop) throw createError({ statusCode: 404, statusMessage: 'Drop não encontrado após atualização.' })
  return toPublicDrop(drop)
})
