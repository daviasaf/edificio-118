import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { categorySchema } from '../../../validators/category'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID da categoria não informado.' })
  }

  const input = await readValidatedBody(event, categorySchema)

  return prisma.category.update({ where: { id }, data: input })
})
