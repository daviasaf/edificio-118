import { prisma } from '../../../../utils/prisma'
import { requireAdminSession } from '../../../../utils/adminAuth'
import { dropInclude, toPublicDrop } from '../../../../utils/drops'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do drop não informado.' })

  const existing = await prisma.drop.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Drop não encontrado.' })

  await prisma.drop.updateMany({ where: { isDefault: true, NOT: { id } }, data: { isDefault: false } })
  const drop = await prisma.drop.update({ where: { id }, data: { isDefault: true }, include: dropInclude })

  return toPublicDrop(drop)
})
