import { z } from 'zod'

const emptyToUndefined = (value: unknown) => value === '' || value === null ? undefined : value
const optionalMoney = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional())

export const saleSchema = z.object({
  productId: z.string().trim().min(1, 'Escolha um produto para registrar a venda.'),
  soldAt: z.coerce.date(),
  quantity: z.coerce.number().int().positive('Informe uma quantidade maior que zero.'),
  unitPrice: optionalMoney,
  unitCost: optionalMoney,
  discount: z.preprocess(emptyToUndefined, z.coerce.number().min(0, 'Desconto não pode ser negativo.').default(0)),
  channel: z.string().trim().min(2, 'Informe a forma de venda.').default('WhatsApp'),
  notes: z.string().trim().optional().nullable().default(''),
  shouldDecreaseStock: z.boolean().default(false)
}).transform((value) => ({
  ...value,
  discount: value.discount || 0,
  notes: value.notes || null
}))

export type SaleInput = z.infer<typeof saleSchema>
