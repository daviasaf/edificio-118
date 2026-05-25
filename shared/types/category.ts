export interface CategoryDTO {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}