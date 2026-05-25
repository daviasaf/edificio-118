import { z } from 'zod'
import { slugify } from '../utils/slug'

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da categoria.'),
  slug: z.string().trim().optional().default(''),
  description: z.string().trim().optional().nullable().default(''),
  isActive: z.boolean().default(true)
}).transform((value) => ({
  ...value,
  slug: slugify(value.slug || value.name),
  description: value.description || null
}))