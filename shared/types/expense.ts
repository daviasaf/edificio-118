import type { AdminProduct } from './product'

export interface ExpenseDTO {
  id: string
  title: string
  category: string
  amount: number
  spentAt: string | Date
  description?: string | null
  expenseType: string
  productId?: string | null
  product?: Pick<AdminProduct, 'id' | 'name' | 'slug' | 'mainImage'> | null
  createdAt: string | Date
  updatedAt: string | Date
}
