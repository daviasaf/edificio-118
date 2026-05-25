import { prisma } from '../../../../utils/prisma'
import { requireAdminSession } from '../../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do preset não informado.' })
  await prisma.reportPreset.delete({ where: { id } })
  return { ok: true }
})
