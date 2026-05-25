import type { GeneratedReport } from '@prisma/client'
import type { SavedReportDTO } from '~~/shared/types/report'

export function toSavedReport(report: GeneratedReport): SavedReportDTO {
  return {
    id: report.id,
    title: report.title,
    type: report.type,
    groupBy: report.groupBy,
    metrics: report.metrics,
    dateFrom: report.dateFrom.toISOString(),
    dateTo: report.dateTo.toISOString(),
    rows: JSON.parse(report.rowsJson || '[]'),
    totals: JSON.parse(report.totalsJson || '{}'),
    csv: report.csv,
    generatedAt: report.createdAt.toISOString(),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt
  }
}
