import { z } from 'zod'

const emptyToNull = (value: unknown) => value === '' || value === undefined ? null : value

export const expenseSchema = z.object({
  title: z.string().trim().min(2, 'Informe o título da despesa.'),
  category: z.string().trim().min(2, 'Informe a categoria da despesa.'),
  amount: z.coerce.number().positive('A despesa precisa ter um valor válido.'),
  spentAt: z.coerce.date(),
  description: z.string().trim().optional().nullable().default(''),
  expenseType: z.string().trim().min(2, 'Informe o tipo da despesa.').default('Outro'),
  productId: z.preprocess(emptyToNull, z.string().trim().nullable())
}).transform((value) => ({
  ...value,
  description: value.description || null,
  productId: value.productId || null
}))

export type ExpenseInput = z.infer<typeof expenseSchema>
