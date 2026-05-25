import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do drop não informado.' })

  const drop = await prisma.drop.findUnique({ where: { id } })
  if (!drop) throw createError({ statusCode: 404, statusMessage: 'Drop não encontrado.' })

  if (drop.isDefault) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Este é o drop padrão do site. Defina outro drop como padrão antes de excluir.'
    })
  }

  await prisma.product.updateMany({ where: { dropId: id }, data: { dropId: null } })
  await prisma.drop.delete({ where: { id } })
  return { ok: true }
})
