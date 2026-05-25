import { requireAdminSession } from '../../../utils/adminAuth'
import { buildDashboardSummary } from '../../../utils/adminAnalytics'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const query = getQuery(event)
  return buildDashboardSummary({
    period: String(query.period || '30d'),
    dateFrom: String(query.dateFrom || ''),
    dateTo: String(query.dateTo || '')
  })
})
