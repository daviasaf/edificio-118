import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { materialSchema } from '../../../validators/material'
import { readValidatedBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const input = await readValidatedBody(event, materialSchema)

  return prisma.material.create({ data: input })
})
