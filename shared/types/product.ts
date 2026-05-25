import type { CategoryDTO } from './category'
import type { MaterialDTO } from './material'
import type { PublicDrop } from './drop'

export interface PublicProduct {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  story?: string | null
  materialNote?: string | null
  salePrice: number
  promotionalPrice?: number | null
  stock: number
  sizes: string[]
  colors: string[]
  images: string[]
  mainImage?: string | null
  isActive: boolean
  isPublished: boolean
  isFeatured: boolean
  allowWhatsapp: boolean
  displayOrder: number
  category?: Pick<CategoryDTO, 'id' | 'name' | 'slug' | 'description'> | null
  material?: Pick<MaterialDTO, 'id' | 'name' | 'description'> | null
  drop?: Pick<PublicDrop, 'id' | 'title' | 'slug' | 'shortLabel'> | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AdminProduct extends PublicProduct {
  categoryId?: string | null
  materialId?: string | null
  dropId?: string | null
  costPrice?: number | null
  profit?: number | null
  profitMargin?: number | null
  internalNotes?: string | null
}