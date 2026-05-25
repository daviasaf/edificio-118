import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { toSavedReport } from '../../../utils/reports'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const reports = await prisma.generatedReport.findMany({ orderBy: { createdAt: 'desc' } })
  return reports.map(toSavedReport)
})
