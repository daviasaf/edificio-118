import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do material não informado.' })
  }

  const productsUsing = await prisma.product.count({ where: { materialId: id } })

  if (productsUsing > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Não dá para excluir um material em uso. Desative ou remova dos produtos primeiro.'
    })
  }

  await prisma.material.delete({ where: { id } })

  return { ok: true }
})