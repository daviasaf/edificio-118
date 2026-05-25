import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export const saleInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      mainImage: true,
      stock: true,
      category: { select: { id: true, name: true, slug: true } }
    }
  }
} satisfies Prisma.ManualSaleInclude

export const expenseInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      mainImage: true
    }
  }
} satisfies Prisma.ExpenseInclude

export type SaleWithProduct = Prisma.ManualSaleGetPayload<{ include: typeof saleInclude }>
export type ExpenseWithProduct = Prisma.ExpenseGetPayload<{ include: typeof expenseInclude }>

export function startOfDay(date: Date) {
  const cloned = new Date(date)
  cloned.setHours(0, 0, 0, 0)
  return cloned
}

export function endOfDay(date: Date) {
  const cloned = new Date(date)
  cloned.setHours(23, 59, 59, 999)
  return cloned
}

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function getPeriodRange(period = '30d', dateFrom?: string, dateTo?: string) {
  const now = new Date()
  let from = startOfDay(new Date(now))
  let to = endOfDay(new Date(now))
  let label = 'Hoje'

  if (period === '7d') {
    from = startOfDay(new Date(now))
    from.setDate(from.getDate() - 6)
    label = 'Últimos 7 dias'
  } else if (period === '30d') {
    from = startOfDay(new Date(now))
    from.setDate(from.getDate() - 29)
    label = 'Últimos 30 dias'
  } else if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
    to = endOfDay(new Date(now))
    label = 'Este mês'
  } else if (period === 'lastMonth') {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
    label = 'Mês passado'
  } else if (period === 'custom' && dateFrom && dateTo) {
    from = startOfDay(new Date(dateFrom))
    to = endOfDay(new Date(dateTo))
    label = 'Período personalizado'
  }

  return { dateFrom: from, dateTo: to, label }
}

export function buildSaleWhere(input: {
  dateFrom?: Date
  dateTo?: Date
  productId?: string
  category?: string
  channel?: string
}) {
  const where: Prisma.ManualSaleWhereInput = {}

  if (input.dateFrom || input.dateTo) {
    where.soldAt = {
      ...(input.dateFrom ? { gte: input.dateFrom } : {}),
      ...(input.dateTo ? { lte: input.dateTo } : {})
    }
  }

  if (input.productId) where.productId = input.productId
  if (input.category) where.categoryNameSnapshot = input.category
  if (input.channel) where.channel = input.channel

  return where
}

export function buildExpenseWhere(input: {
  dateFrom?: Date
  dateTo?: Date
  productId?: string
  category?: string
  expenseType?: string
}) {
  const where: Prisma.ExpenseWhereInput = {}

  if (input.dateFrom || input.dateTo) {
    where.spentAt = {
      ...(input.dateFrom ? { gte: input.dateFrom } : {}),
      ...(input.dateTo ? { lte: input.dateTo } : {})
    }
  }

  if (input.productId) where.productId = input.productId
  if (input.category) where.category = input.category
  if (input.expenseType) where.expenseType = input.expenseType

  return where
}

function addToMap(map: Map<string, Record<string, number>>, key: string, values: Record<string, number>) {
  const current = map.get(key) || {}
  for (const [name, value] of Object.entries(values)) {
    current[name] = money((current[name] || 0) + value)
  }
  map.set(key, current)
}

function mapToPoints(map: Map<string, Record<string, number>>) {
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, values]) => ({ label, ...values }))
}

export async function buildDashboardSummary(input: { period?: string; dateFrom?: string; dateTo?: string }) {
  const range = getPeriodRange(input.period, input.dateFrom, input.dateTo)
  const saleWhere = buildSaleWhere({ dateFrom: range.dateFrom, dateTo: range.dateTo })
  const expenseWhere = buildExpenseWhere({ dateFrom: range.dateFrom, dateTo: range.dateTo })

  const [sales, expenses, publishedProducts, draftProducts, lowStockProducts] = await Promise.all([
    prisma.manualSale.findMany({ where: saleWhere, include: saleInclude, orderBy: { soldAt: 'asc' } }),
    prisma.expense.findMany({ where: expenseWhere, include: expenseInclude, orderBy: { spentAt: 'asc' } }),
    prisma.product.count({ where: { isPublished: true, isActive: true } }),
    prisma.product.count({ where: { OR: [{ isPublished: false }, { isActive: false }] } }),
    prisma.product.count({ where: { stock: { lte: 3 } } })
  ])

  const revenue = money(sales.reduce((sum, sale) => sum + sale.totalRevenue, 0))
  const grossProfit = money(sales.reduce((sum, sale) => sum + sale.estimatedProfit, 0))
  const expenseTotal = money(expenses.reduce((sum, expense) => sum + expense.amount, 0))
  const quantitySold = sales.reduce((sum, sale) => sum + sale.quantity, 0)
  const ticketAverage = sales.length ? money(revenue / sales.length) : 0

  const salesByDate = new Map<string, Record<string, number>>()
  const profitByDate = new Map<string, Record<string, number>>()
  const expensesByDate = new Map<string, Record<string, number>>()
  const products = new Map<string, Record<string, number>>()
  const categories = new Map<string, Record<string, number>>()
  const finance = new Map<string, Record<string, number>>()

  for (const sale of sales) {
    const date = formatDateKey(sale.soldAt)
    const product = sale.productNameSnapshot
    const category = sale.categoryNameSnapshot || 'Sem categoria'
    addToMap(salesByDate, date, { revenue: sale.totalRevenue, quantity: sale.quantity })
    addToMap(profitByDate, date, { profit: sale.estimatedProfit })
    addToMap(products, product, { revenue: sale.totalRevenue, quantity: sale.quantity })
    addToMap(categories, category, { revenue: sale.totalRevenue, quantity: sale.quantity })
    addToMap(finance, date, { revenue: sale.totalRevenue, profit: sale.estimatedProfit })
  }

  for (const expense of expenses) {
    const date = formatDateKey(expense.spentAt)
    addToMap(expensesByDate, date, { expenses: expense.amount })
    addToMap(finance, date, { expenses: expense.amount, profit: -expense.amount })
  }

  const topProducts = mapToPoints(products).sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0)).slice(0, 6)
  const topProduct = topProducts[0]
    ? { name: String(topProducts[0].label), quantity: Number(topProducts[0].quantity || 0), revenue: Number(topProducts[0].revenue || 0) }
    : null

  return {
    period: {
      dateFrom: range.dateFrom.toISOString(),
      dateTo: range.dateTo.toISOString(),
      label: range.label
    },
    totals: {
      revenue,
      grossProfit,
      expenses: expenseTotal,
      netProfit: money(grossProfit - expenseTotal),
      quantitySold,
      ticketAverage,
      lowStockProducts,
      publishedProducts,
      draftProducts
    },
    topProduct,
    charts: {
      salesByDate: mapToPoints(salesByDate),
      profitByDate: mapToPoints(profitByDate),
      expensesByDate: mapToPoints(expensesByDate),
      topProducts,
      salesByCategory: mapToPoints(categories).sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0)),
      financeByDate: mapToPoints(finance)
    },
    recentSales: sales.slice(-6).reverse().map((sale) => ({
      id: sale.id,
      productNameSnapshot: sale.productNameSnapshot,
      totalRevenue: sale.totalRevenue,
      estimatedProfit: sale.estimatedProfit,
      quantity: sale.quantity,
      soldAt: sale.soldAt,
      channel: sale.channel
    }))
  }
}

export function buildCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return [headers.join(','), ...rows.map((row) => headers.map((key) => escape(row[key])).join(','))].join('\n')
}
