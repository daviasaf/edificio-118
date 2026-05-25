import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { materialSchema } from '../../../validators/material'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do material não informado.' })
  }

  const input = await readValidatedBody(event, materialSchema)

  return prisma.material.update({ where: { id }, data: input })
})
