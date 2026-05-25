import { z } from 'zod'

export const materialSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do material.'),
  description: z.string().trim().optional().nullable().default(''),
  isActive: z.boolean().default(true)
}).transform((value) => ({
  ...value,
  description: value.description || null
}))