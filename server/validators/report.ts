import { z } from 'zod'

const reportTypes = ['Vendas', 'Lucro', 'Despesas', 'Produtos mais vendidos', 'Categorias mais vendidas', 'Resumo financeiro', 'Estoque'] as const
const groupTypes = ['data', 'produto', 'categoria', 'canal'] as const

export const reportGenerateSchema = z.object({
  type: z.enum(reportTypes),
  groupBy: z.enum(groupTypes),
  metrics: z.array(z.string().trim()).min(1, 'Escolha pelo menos uma métrica.'),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date()
}).refine((value) => value.dateFrom <= value.dateTo, {
  message: 'A data inicial precisa ser antes da data final.',
  path: ['dateFrom']
})

export const reportPresetSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do preset.'),
  type: z.enum(reportTypes),
  groupBy: z.enum(groupTypes),
  metrics: z.array(z.string().trim()).min(1, 'Escolha pelo menos uma métrica.'),
  dateFrom: z.coerce.date().optional().nullable(),
  dateTo: z.coerce.date().optional().nullable()
})
