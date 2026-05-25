import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true
    },
    orderBy: { name: 'asc' }
  })
})