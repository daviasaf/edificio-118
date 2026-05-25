import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function calcProfit(costPrice: number, salePrice: number, promotionalPrice?: number | null) {
  const revenuePrice = promotionalPrice || salePrice
  const profit = revenuePrice - costPrice
  const profitMargin = revenuePrice > 0 ? (profit / revenuePrice) * 100 : 0

  return {
    profit: Number(profit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2))
  }
}

async function main() {
  await prisma.generatedReport.deleteMany()
  await prisma.reportPreset.deleteMany()
  await prisma.manualSale.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.product.deleteMany()
  await prisma.savedColor.deleteMany()
  await prisma.drop.deleteMany()
  await prisma.category.deleteMany()
  await prisma.material.deleteMany()

  const camisetas = await prisma.category.create({
    data: {
      name: 'Camisetas',
      slug: 'camisetas',
      description: 'O prédio no peito. Peças pra quem vive o corre sem explicar demais.'
    }
  })

  const moletons = await prisma.category.create({
    data: {
      name: 'Moletons',
      slug: 'moletons',
      description: 'Camadas pesadas pra rua, noite, pressa e vivência real.'
    }
  })

  const acessorios = await prisma.category.create({
    data: {
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Detalhes pequenos, presença grande.'
    }
  })

  const calcas = await prisma.category.create({
    data: {
      name: 'Calças',
      slug: 'calcas',
      description: 'Modelagem pra andar no mundo como quem sabe o próprio caminho.'
    }
  })

  const algodao = await prisma.material.create({ data: { name: 'Algodão pesado', description: 'Toque encorpado, confortável e feito pra usar de verdade.' } })

  const vivenciaReal = await prisma.drop.create({
    data: {
      title: 'O prédio feito pra quem vive o corre.',
      slug: 'vivencia-real',
      shortLabel: 'baseado em vivências reais',
      description: 'O Edificio 118 nasce do que acontece no dia a dia e fica martelando na cabeça. É roupa pra quem vive coisa demais pra explicar pouco.',
      storySectionTitle: 'O Edificio é o que passa na cabeça de quem vive o corre.',
      storySectionDescription: 'Não é sobre parecer arrumado. É sobre parecer você. Cada estampa tem uma fita, uma lembrança, um incômodo ou uma cena que alguém já viveu de verdade.',
      images: [],
      isActive: true,
      isFeatured: true,
      isDefault: true,
      displayOrder: 1,
      buttonLabel: 'Ver o drop',
      secondaryButtonLabel: 'Entender a fita',
      highlightColor: '#D6FF2F',
      layoutModel: 'editorial-building',
      dropPhrases: ['Nada aqui é só estampa.', 'Cada peça tem uma fita.', 'O corre também veste.', 'Arquivo de uma vivência real.']
    }
  })

  await prisma.drop.createMany({
    data: [
      {
        title: 'Manifesto do andar errado',
        slug: 'manifesto-andar-errado',
        shortLabel: 'texto antes de estampa',
        description: 'Um drop mais narrativo, pensado pra mostrar frase forte, respiro e imagem entrando no scroll.',
        storySectionTitle: 'Nem todo caminho começa no térreo.',
        storySectionDescription: 'Esse formato é pra quando o drop precisa falar antes de vender. Primeiro vem a história, depois vem a peça.',
      images: [],
        isActive: false,
        isFeatured: false,
        isDefault: false,
        displayOrder: 2,
        buttonLabel: 'Ver o manifesto',
        secondaryButtonLabel: 'Descer a fita',
        highlightColor: '#A855F7',
        layoutModel: 'horizontal-corridor',
        dropPhrases: ['Corredor de imagem.', 'O andar errado também leva.', 'Foto antes de legenda.', 'A rua passa em sequência.']
      },
      {
        title: 'Manifesto gigante do fundo',
        slug: 'manifesto-gigante-fundo',
        shortLabel: 'texto vindo do fundo',
        description: 'Modelo experimental onde a frase do drop cresce por trás das fotos e ocupa a tela com a cor da campanha.',
        storySectionTitle: 'A frase vira parede antes de virar peça.',
        storySectionDescription: 'Esse modelo é para drops com mensagem forte: o texto vem do fundo, atravessa as fotos e domina a tela no scroll.',
      images: [],
        isActive: false,
        isFeatured: false,
        isDefault: false,
        displayOrder: 3,
        buttonLabel: 'Ver manifesto',
        secondaryButtonLabel: 'Descer a fita',
        highlightColor: '#8E1B1B',
        layoutModel: 'immersive-manifesto',
        dropPhrases: ['Nada aqui é só estampa.', 'O corre também veste.', 'Vivência real.', 'O prédio respira.']
      },
      {
        title: 'Galeria do corre organizado',
        slug: 'galeria-corre-organizado',
        shortLabel: 'caos com direção',
        description: 'Modelo visual para drops com mais imagens, grid editorial e entrada progressiva das fotos.',
        storySectionTitle: 'Muita imagem, uma só fita.',
        storySectionDescription: 'Quando o drop tem bastante material visual, a home vira uma galeria viva e ainda mantém o CTA claro.',
      images: [],
        isActive: false,
        isFeatured: false,
        isDefault: false,
        displayOrder: 4,
        buttonLabel: 'Abrir a galeria',
        secondaryButtonLabel: 'Entender o caos',
        highlightColor: '#B63A26',
        layoutModel: 'immersive-manifesto',
        dropPhrases: ['Parede de vivências.', 'Nada nasceu limpo.', 'A cidade colou tudo.', 'Cada canto tem uma fita.']
      },
      {
        title: 'Sinal da peça principal',
        slug: 'sinal-peca-principal',
        shortLabel: 'olha de perto',
        description: 'Modelo de impacto para quando uma foto segura o drop inteiro e o manifesto entra no scroll.',
        storySectionTitle: 'A imagem chega antes da explicação.',
        storySectionDescription: 'A imagem vira sinal: puxa o olhar para aquilo que nasceu da vivência antes de virar roupa.',
      images: [],
        isActive: false,
        isFeatured: false,
        isDefault: false,
        displayOrder: 5,
        buttonLabel: 'Ver o drop',
        secondaryButtonLabel: 'Ler a fita',
        highlightColor: '#60A5FA',
        layoutModel: 'impact-zoom',
        dropPhrases: ['Sinal aberto.', 'A foto também fala.', 'O detalhe entrega.', 'Vivência em alerta.']
      },
      {
        title: 'Arquivo completo do prédio',
        slug: 'arquivo-completo-predio',
        shortLabel: 'campanha completa',
        description: 'Modelo grande para transformar a home em arquivo visual com hero, horizontal, colagem e produtos.',
        storySectionTitle: 'Um drop grande precisa de arquivo, não só vitrine.',
        storySectionDescription: 'Aqui cabem fotos grandes, fotos pequenas, frases, produtos e a sensação de campanha completa.',
      images: [],
        isActive: false,
        isFeatured: false,
        isDefault: false,
        displayOrder: 6,
        buttonLabel: 'Abrir arquivo',
        secondaryButtonLabel: 'Entender campanha',
        highlightColor: '#F97316',
        layoutModel: 'impact-zoom',
        dropPhrases: ['Arquivo aberto.', 'Campanha inteira.', 'Vivência em sequência.', 'O prédio guarda tudo.']
      }
    ]
  })


  await prisma.savedColor.createMany({
    data: [
      { name: 'Verde ácido', value: '#D6FF2F' },
      { name: 'Vinho queimado', value: '#8E1B1B' },
      { name: 'Vermelho tijolo', value: '#B63A26' }
    ]
  })

  const moletom = await prisma.material.create({ data: { name: 'Moletom felpado', description: 'Malha quente, presença de rua e caimento amplo.' } })
  const sarja = await prisma.material.create({ data: { name: 'Sarja urbana', description: 'Estrutura firme pra peça aguentar o corre.' } })

  const products = [
    {
      name: 'Camiseta Ou Corre Oversized',
      slug: 'camiseta-ou-corre-oversized',
      shortDescription: 'A peça do manifesto: ou corre com nós ou corre de nós.',
      description: 'Camiseta oversized em algodão pesado, caimento amplo e estampa frontal com presença. Não é uma camiseta lisa tentando ser premium. É recado.',
      story: 'Essa peça vem da frase que resume o prédio: ou corre com nós ou corre de nós. Feita pra quem vive o corre e sabe que a rua não espera ninguém.',
      materialNote: 'Algodão pesado, gola firme e modelagem oversized.',
      categoryId: camisetas.id,
      materialId: algodao.id,
      dropId: vivenciaReal.id,
      costPrice: 48,
      salePrice: 129.9,
      promotionalPrice: 109.9,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Off-white'],
      stock: 18,
      images: ['/images/editorial/corre-com-nos.webp', '/images/editorial/corre-com-nos-2.webp'],
      mainImage: '/images/editorial/corre-com-nos.webp',
      isActive: true,
      isPublished: true,
      isFeatured: true,
      allowWhatsapp: true,
      displayOrder: 1,
      internalNotes: 'Produto principal da primeira dobra.'
    },
    {
      name: 'Camiseta Prédio 118',
      slug: 'camiseta-predio-118',
      shortDescription: 'O prédio feito pra quem vive o corre, baseado em vivências reais.',
      description: 'Camiseta autoral com estética streetwear e leitura de manifesto. Uma peça pra sair como quem carrega uma história no corpo.',
      story: 'O prédio não é só concreto. É tudo que acontece no dia a dia: cobrança, rolê, ônibus, sonho, cansaço e vontade de fazer acontecer.',
      materialNote: 'Algodão confortável com toque macio e estrutura firme.',
      categoryId: camisetas.id,
      materialId: algodao.id,
      dropId: vivenciaReal.id,
      costPrice: 44,
      salePrice: 119.9,
      promotionalPrice: null,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Branco', 'Preto lavado'],
      stock: 14,
      images: ['/images/editorial/corre-com-nos-2.webp', '/images/editorial/corre-com-nos.webp'],
      mainImage: '/images/editorial/corre-com-nos-2.webp',
      isActive: true,
      isPublished: true,
      isFeatured: true,
      allowWhatsapp: true,
      displayOrder: 2,
      internalNotes: 'Usar como produto editorial no site.'
    },
    {
      name: 'Sticker Vivência Real',
      slug: 'sticker-vivencia-real',
      shortDescription: 'Um detalhe pequeno pra marcar o corre em qualquer canto.',
      description: 'Sticker 118 com visual forte e aplicação fácil. Pra notebook, celular, espelho, quarto ou onde o prédio fizer sentido.',
      story: 'Nem toda peça precisa ocupar muito espaço. Às vezes o recado cabe num adesivo, mas continua pesado.',
      materialNote: 'Adesivo vinílico com acabamento fosco.',
      categoryId: acessorios.id,
      materialId: sarja.id,
      dropId: vivenciaReal.id,
      costPrice: 4,
      salePrice: 19.9,
      promotionalPrice: null,
      sizes: ['Único'],
      colors: ['Preto e branco'],
      stock: 40,
      images: ['/images/editorial/corre-com-nos-3.webp'],
      mainImage: '/images/editorial/corre-com-nos-3.webp',
      isActive: true,
      isPublished: true,
      isFeatured: true,
      allowWhatsapp: true,
      displayOrder: 3,
      internalNotes: 'Acessório de entrada.'
    },
    {
      name: 'Moletom Elevador Parado',
      slug: 'moletom-elevador-parado',
      shortDescription: 'Moletom pesado pra subir mesmo quando o elevador não ajuda.',
      description: 'Moletom de modelagem ampla, punhos firmes e interior felpado. Feito pra noites longas, rua fria e cabeça cheia.',
      story: 'Elevador parado é sobre ter que subir no braço. Cada andar é uma fase do corre. Ninguém prometeu facilidade, só presença.',
      materialNote: 'Moletom felpado 3 cabos, gramatura alta.',
      categoryId: moletons.id,
      materialId: moletom.id,
      costPrice: 92,
      salePrice: 219.9,
      promotionalPrice: null,
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Grafite', 'Vinho queimado'],
      stock: 9,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80'],
      mainImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      isPublished: true,
      isFeatured: false,
      allowWhatsapp: true,
      displayOrder: 4,
      internalNotes: 'Fotografar com locação urbana depois.'
    },
    {
      name: 'Calça Cargo Planta Baixa',
      slug: 'calca-cargo-planta-baixa',
      shortDescription: 'Cargo de sarja pra mapear o próprio caminho.',
      description: 'Calça cargo de sarja com bolsos amplos, cintura confortável e modelagem pensada para uso real.',
      story: 'Antes de construir qualquer coisa, alguém desenha uma planta. Essa peça é sobre tentar achar o andar certo mesmo sem mapa pronto.',
      materialNote: 'Sarja estruturada, resistente e confortável.',
      categoryId: calcas.id,
      materialId: sarja.id,
      costPrice: 76,
      salePrice: 169.9,
      promotionalPrice: 149.9,
      sizes: ['38', '40', '42', '44'],
      colors: ['Preto', 'Verde sujo'],
      stock: 11,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80'],
      mainImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      isPublished: true,
      isFeatured: false,
      allowWhatsapp: true,
      displayOrder: 5,
      internalNotes: null
    }
  ]

  for (const item of products) {
    const money = calcProfit(item.costPrice, item.salePrice, item.promotionalPrice)
    await prisma.product.create({ data: { ...item, ...money } })
  }

  console.log('Seed do Edificio 118 concluído: o prédio tá de pé.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
