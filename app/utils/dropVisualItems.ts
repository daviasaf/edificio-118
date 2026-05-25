import type { DropVisualItem, PublicDrop } from '~~/shared/types/drop'

const FALLBACK_IMAGES = [
  '/images/editorial/corre-com-nos.webp',
  '/images/editorial/corre-com-nos-3.webp'
]

export function buildDropVisualItems(drop?: PublicDrop | null, limit = 24): DropVisualItem[] {
  const products = (drop?.products || []).filter((product) => product?.isActive !== false && product?.isPublished !== false)
  const items = products.flatMap((product) => {
    const images = Array.from(new Set([product.mainImage, ...(product.images || [])].filter(Boolean) as string[]))
    return images.map((image, imageIndex) => ({
      image,
      productSlug: product.slug || '',
      productName: product.name || drop?.title || 'Produto Edificio 118',
      price: product.promotionalPrice || product.salePrice || null,
      salePrice: product.salePrice,
      promotionalPrice: product.promotionalPrice,
      categoryName: product.category?.name || null,
      materialName: product.material?.name || null,
      alt: `${product.name || 'Produto Edificio 118'} - campanha ${drop?.title || 'Edificio 118'}`,
      imageIndex
    }))
  }).filter((item) => item.image && item.productSlug)

  if (items.length) return items.slice(0, limit)

  return Array.from({ length: 5 }, (_, index) => ({
    image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] || FALLBACK_IMAGES[0]!,
    productSlug: '',
    productName: drop?.title || 'Edificio 118',
    price: null,
    salePrice: null,
    promotionalPrice: null,
    categoryName: null,
    materialName: null,
    alt: `${drop?.title || 'Edificio 118'} - campanha editorial`,
    imageIndex: index
  }))
}

export function countDropProductImages(drop?: PublicDrop | null) {
  return buildDropVisualItems(drop, 999).filter((item) => item.productSlug).length
}
