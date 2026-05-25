import { prisma } from '../../../../utils/prisma'
import { requireAdminSession } from '../../../../utils/adminAuth'
import { reportPresetSchema } from '../../../../validators/report'
import { readValidatedBody } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const input = await readValidatedBody(event, reportPresetSchema)
  return prisma.reportPreset.create({ data: input })
})
