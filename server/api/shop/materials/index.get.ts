import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.material.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true
    },
    orderBy: { name: 'asc' }
  })
})