import { prisma } from '../../../utils/prisma'
import { dropInclude, toPublicDrop } from '../../../utils/drops'

const fallbackDrop = {
  id: 'fallback',
  title: 'O prédio feito pra quem vive o corre.',
  slug: '',
  description: 'O Edificio 118 nasce do que acontece no dia a dia e fica martelando na cabeça. É roupa pra quem vive coisa demais pra explicar pouco.',
  shortLabel: 'baseado em vivências reais',
  images: [],
  isActive: true,
  isFeatured: false,
  isDefault: true,
  displayOrder: 0,
  buttonLabel: 'Ver o drop',
  secondaryButtonLabel: 'Entender a fita',
  storySectionTitle: 'O Edificio é o que passa na cabeça de quem vive o corre.',
  storySectionDescription: 'Não é sobre parecer arrumado. É sobre parecer você. Cada estampa tem uma fita, uma lembrança, um incômodo ou uma cena que alguém já viveu de verdade.',
  highlightColor: '#D6FF2F',
  layoutModel: 'editorial-building',
  dropPhrases: ['Nada aqui é só estampa.', 'Cada peça tem uma fita.', 'O corre também veste.'],
  productCount: 0
}

export default defineEventHandler(async () => {
  const activeDrop = await prisma.drop.findFirst({
    where: { isActive: true },
    include: dropInclude,
    orderBy: [{ updatedAt: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }]
  })

  if (activeDrop) return toPublicDrop(activeDrop)

  const defaultDrop = await prisma.drop.findFirst({
    where: { isDefault: true },
    include: dropInclude,
    orderBy: [{ updatedAt: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }]
  })

  if (defaultDrop) return toPublicDrop(defaultDrop)
  return fallbackDrop
})
