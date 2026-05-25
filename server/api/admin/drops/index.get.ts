import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { dropInclude, toPublicDrop } from '../../../utils/drops'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const drops = await prisma.drop.findMany({
    include: dropInclude,
    orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }, { displayOrder: 'asc' }]
  })
  return drops.map(toPublicDrop)
})
