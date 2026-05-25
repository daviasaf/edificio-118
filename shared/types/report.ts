export interface ChartPoint {
  label: string
  revenue?: number
  expenses?: number
  profit?: number
  quantity?: number
  amount?: number
}

export interface DashboardSummary {
  period: {
    dateFrom: string
    dateTo: string
    label: string
  }
  totals: {
    revenue: number
    grossProfit: number
    expenses: number
    netProfit: number
    quantitySold: number
    ticketAverage: number
    lowStockProducts: number
    publishedProducts: number
    draftProducts: number
  }
  topProduct?: {
    name: string
    quantity: number
    revenue: number
  } | null
  charts: {
    salesByDate: ChartPoint[]
    profitByDate: ChartPoint[]
    expensesByDate: ChartPoint[]
    topProducts: ChartPoint[]
    salesByCategory: ChartPoint[]
    financeByDate: ChartPoint[]
  }
  recentSales: Array<{
    id: string
    productNameSnapshot: string
    totalRevenue: number
    estimatedProfit: number
    quantity: number
    soldAt: string | Date
    channel: string
  }>
}

export interface ReportPresetDTO {
  id: string
  name: string
  type: string
  groupBy: string
  metrics: string[]
  dateFrom?: string | Date | null
  dateTo?: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface GeneratedReportDTO {
  title: string
  type: string
  groupBy: string
  metrics: string[]
  dateFrom: string
  dateTo: string
  rows: Array<Record<string, string | number>>
  totals: Record<string, number>
  csv: string
  generatedAt: string
}


export interface SavedReportDTO extends GeneratedReportDTO {
  id: string
  createdAt: string | Date
  updatedAt?: string | Date
}
