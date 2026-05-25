import { prisma } from '../../../utils/prisma'
import { requireAdminSession } from '../../../utils/adminAuth'
import { reportGenerateSchema } from '../../../validators/report'
import { buildCsv, buildExpenseWhere, buildSaleWhere, endOfDay, expenseInclude, formatDateKey, money, saleInclude, startOfDay } from '../../../utils/adminAnalytics'
import { readValidatedBody } from '../../../utils/validation'
import { toSavedReport } from '../../../utils/reports'

function addRow(map: Map<string, Record<string, string | number>>, label: string, values: Record<string, number>) {
  const row = map.get(label) || { grupo: label }
  for (const [key, value] of Object.entries(values)) {
    row[key] = money(Number(row[key] || 0) + value)
  }
  map.set(label, row)
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const input = await readValidatedBody(event, reportGenerateSchema)
  const dateFrom = startOfDay(input.dateFrom)
  const dateTo = endOfDay(input.dateTo)

  const [sales, expenses, products] = await Promise.all([
    prisma.manualSale.findMany({ where: buildSaleWhere({ dateFrom, dateTo }), include: saleInclude, orderBy: { soldAt: 'asc' } }),
    prisma.expense.findMany({ where: buildExpenseWhere({ dateFrom, dateTo }), include: expenseInclude, orderBy: { spentAt: 'asc' } }),
    prisma.product.findMany({ include: { category: true }, orderBy: { updatedAt: 'desc' } })
  ])

  const grouped = new Map<string, Record<string, string | number>>()

  if (input.type === 'Estoque') {
    for (const product of products) {
      const label = input.groupBy === 'categoria' ? product.category?.name || 'Sem categoria' : product.name
      addRow(grouped, label, {
        estoque: product.stock,
        valorEmEstoque: (product.promotionalPrice || product.salePrice) * product.stock,
        custoEmEstoque: (product.costPrice || 0) * product.stock
      })
    }
  } else {
    for (const sale of sales) {
      const label = input.groupBy === 'produto'
        ? sale.productNameSnapshot
        : input.groupBy === 'categoria'
          ? sale.categoryNameSnapshot || 'Sem categoria'
          : input.groupBy === 'canal'
            ? sale.channel
            : formatDateKey(sale.soldAt)

      addRow(grouped, label, {
        faturamento: sale.totalRevenue,
        lucro: sale.estimatedProfit,
        quantidade: sale.quantity
      })
    }

    for (const expense of expenses) {
      const label = input.groupBy === 'produto'
        ? expense.product?.name || 'Sem produto'
        : input.groupBy === 'categoria'
          ? expense.category
          : input.groupBy === 'canal'
            ? expense.expenseType
            : formatDateKey(expense.spentAt)

      addRow(grouped, label, {
        despesas: expense.amount
      })
    }
  }

  const rows = Array.from(grouped.values()).map((row) => {
    const faturamento = Number(row.faturamento || 0)
    const despesas = Number(row.despesas || 0)
    const lucro = Number(row.lucro || 0)
    const quantidade = Number(row.quantidade || 0)
    return {
      ...row,
      ticketMedio: quantidade ? money(faturamento / quantidade) : 0,
      margemEstimada: faturamento ? money((lucro / faturamento) * 100) : 0,
      resultadoLiquido: money(lucro - despesas)
    }
  })

  const totals = rows.reduce<Record<string, number>>((acc, row) => {
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'grupo' && typeof value === 'number') acc[key] = money((acc[key] || 0) + value)
    }
    return acc
  }, {})

  const csv = buildCsv(rows)
  const saved = await prisma.generatedReport.create({
    data: {
      title: `${input.type} por ${input.groupBy}`,
      type: input.type,
      groupBy: input.groupBy,
      metrics: input.metrics,
      dateFrom,
      dateTo,
      rowsJson: JSON.stringify(rows),
      totalsJson: JSON.stringify(totals),
      csv
    }
  })

  return toSavedReport(saved)
})
