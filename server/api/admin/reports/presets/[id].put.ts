import { prisma } from '../../../../utils/prisma'
import { requireAdminSession } from '../../../../utils/adminAuth'
import { reportPresetSchema } from '../../../../validators/report'
import { readValidatedBody } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do preset não informado.' })
  const input = await readValidatedBody(event, reportPresetSchema)
  return prisma.reportPreset.update({ where: { id }, data: input })
})
