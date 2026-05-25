import { prisma } from '../../../utils/prisma'
import { dropInclude, toPublicDrop } from '../../../utils/drops'

export default defineEventHandler(async () => {
  const drops = await prisma.drop.findMany({
    where: { OR: [{ isActive: true }, { isDefault: true }] },
    include: dropInclude,
    orderBy: [{ isActive: 'desc' }, { isDefault: 'desc' }, { displayOrder: 'asc' }, { updatedAt: 'desc' }]
  })
  return drops.map(toPublicDrop)
})
