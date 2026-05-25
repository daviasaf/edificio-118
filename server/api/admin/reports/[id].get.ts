import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { toSavedReport } from '../../../utils/reports'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do relatório não informado.' })
  const report = await prisma.generatedReport.findUnique({ where: { id } })
  if (!report) throw createError({ statusCode: 404, statusMessage: 'Relatório não encontrado.' })
  return toSavedReport(report)
})
