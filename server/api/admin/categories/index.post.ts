import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { categorySchema } from '../../../validators/category'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const input = await readValidatedBody(event, categorySchema)

  return prisma.category.create({ data: input })
})
