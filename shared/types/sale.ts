import type { AdminProduct } from './product'

export interface ManualSaleDTO {
  id: string
  productId: string
  product?: Pick<AdminProduct, 'id' | 'name' | 'slug' | 'mainImage' | 'stock'> | null
  productNameSnapshot: string
  categoryNameSnapshot?: string | null
  soldAt: string | Date
  quantity: number
  unitPrice: number
  unitCost: number
  discount: number
  totalRevenue: number
  totalCost: number
  estimatedProfit: number
  channel: string
  notes?: string | null
  shouldDecreaseStock: boolean
  createdAt: string | Date
  updatedAt: string | Date
}
