import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  return prisma.savedColor.findMany({ orderBy: { createdAt: 'desc' } })
})
