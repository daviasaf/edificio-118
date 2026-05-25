import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { dropInclude, toPublicDrop } from '../../../utils/drops'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do drop não informado.' })

  const drop = await prisma.drop.findUnique({ where: { id }, include: dropInclude })
  if (!drop) throw createError({ statusCode: 404, statusMessage: 'Drop não encontrado.' })
  return toPublicDrop(drop)
})
