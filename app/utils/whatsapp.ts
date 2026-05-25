import type { PublicProduct } from '~~/shared/types/product'
import { formatCurrency } from './formatCurrency'

interface BuildWhatsAppOptions {
  product: PublicProduct
  size: string
  color: string
  quantity: number
  productUrl: string
  whatsappNumber: string
}

export function buildWhatsAppLink(options: BuildWhatsAppOptions) {
  const price = options.product.promotionalPrice || options.product.salePrice
  const message = [
    'Salve! Vi essa peça no site do Edificio 118 e curti demais.',
    '',
    `Peça: ${options.product.name}`,
    `Tamanho: ${options.size}`,
    `Cor/Variação: ${options.color}`,
    `Quantidade: ${options.quantity}`,
    `Valor: ${formatCurrency(price)}`,
    `Link: ${options.productUrl}`,
    '',
    'Consegue me ajudar a fechar essa?'
  ].join('\n')

  return `https://wa.me/${options.whatsappNumber}?text=${encodeURIComponent(message)}`
}
