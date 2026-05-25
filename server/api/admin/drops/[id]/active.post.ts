import { z } from 'zod'
import { prisma } from '../../../../utils/prisma'
import { requireAdminSession } from '../../../../utils/adminAuth'
import { dropInclude, toPublicDrop } from '../../../../utils/drops'
import { readValidatedBody } from '../../../../utils/validation'

const toggleSchema = z.object({
  active: z.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do drop nao informado.' })

  const existing = await prisma.drop.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Drop nao encontrado.' })

  const { active } = await readValidatedBody(event, toggleSchema)

  if (active) {
    await prisma.drop.updateMany({ where: { isActive: true, NOT: { id } }, data: { isActive: false } })
  }

  const drop = await prisma.drop.update({
    where: { id },
    data: { isActive: active, images: [] },
    include: dropInclude
  })

  return toPublicDrop(drop)
})
