export type DropLayoutModel = 'editorial-building' | 'horizontal-corridor' | 'immersive-manifesto' | 'impact-zoom'

export interface DropVisualItem {
  image: string
  productSlug: string
  productName: string
  price?: number | null
  salePrice?: number | null
  promotionalPrice?: number | null
  categoryName?: string | null
  materialName?: string | null
  alt: string
  imageIndex?: number
}

export interface PublicDrop {
  id: string
  title: string
  slug: string
  description: string
  shortLabel?: string | null
  images: string[]
  isActive: boolean
  isFeatured: boolean
  isDefault?: boolean
  displayOrder: number
  buttonLabel?: string | null
  secondaryButtonLabel?: string | null
  storySectionTitle?: string | null
  storySectionDescription?: string | null
  highlightColor?: string | null
  layoutModel?: DropLayoutModel
  dropPhrases?: string[]
  productCount?: number
  products?: Array<{
    id: string
    name?: string
    slug?: string
    mainImage?: string | null
    images?: string[]
    salePrice?: number | null
    promotionalPrice?: number | null
    stock?: number
    isActive?: boolean
    isPublished?: boolean
    dropId?: string | null
    category?: { id?: string; name?: string; slug?: string } | null
    material?: { id?: string; name?: string } | null
  }>
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AdminDrop extends PublicDrop {}

export interface SavedColorDTO {
  id: string
  name: string
  value: string
  createdAt?: string | Date
  updatedAt?: string | Date
}
