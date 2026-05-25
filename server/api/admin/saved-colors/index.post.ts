import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { savedColorSchema } from '../../../validators/drop'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const input = await readValidatedBody(event, savedColorSchema)
  return prisma.savedColor.create({ data: input })
})
