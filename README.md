# Edificio 118 — o prédio feito pra quem vive o corre

Loja streetwear em Nuxt 4 para a marca **Edificio 118**.

A experiência pública foi refinada para parecer uma marca autoral, jovem, urbana e editorial. A copy principal do site gira em torno da ideia:

> O prédio 🏙️ feito pra quem vive o corre. Baseado em vivências reais.

Não existe login de cliente, carrinho ou checkout. A venda acontece direto pelo WhatsApp.

## O que esta versão entrega

- Home editorial com manifesto, fotos grandes, frases de marca e transição forte para o drop.
- Textos com tom mais íntimo, direto, jovem e de rua.
- CTAs mais fortes como **Ver o drop**, **Quero essa aqui**, **Escolher minha peça** e **Fechar no papo**.
- Produtos com página individual completa: galeria, preço, tamanho, cor/variação, quantidade, história da peça e WhatsApp.
- Listagem de produtos mobile first com filtros discretos.
- Empty states e loading states com linguagem da marca.
- Scroll premium com Lenis em plugin `.client.ts`.
- Reveal on scroll com IntersectionObserver.
- Parallax sutil em imagens editoriais.
- Respeito a `prefers-reduced-motion`.
- Painel admin mantido em `/admin`, protegido por `ADMIN_SENHA` e cookie HTTP-only.
- CRUD de produtos, categorias e materiais.
- Upload de imagens com Sharp.
- Prisma ORM com MongoDB Atlas.

## Stack

- Nuxt 4
- Vue 3
- TypeScript
- Nuxt UI
- Tailwind CSS
- Prisma ORM
- MongoDB Atlas
- Zod
- Sharp
- Vercel Blob
- Lenis

## Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL="mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/edificio118?retryWrites=true&w=majority"
DIRECT_URL="mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/edificio118?retryWrites=true&w=majority"
ADMIN_SENHA="sua-senha-admin"
ADMIN_SESSION_SECRET="um-segredo-grande-para-cookie"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxxxxxx"
WHATSAPP_NUMBER="5522999999999"
NUXT_PUBLIC_SITE_NAME="Edificio 118"
NUXT_PUBLIC_SITE_URL="http://localhost:3000"
NUXT_PUBLIC_PLACEHOLDER_IMAGE="/images/editorial/corre-com-nos.webp"
```

### Atenção ao MongoDB Atlas

A URL precisa ter o nome do banco depois do host:

```txt
mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/edificio118?retryWrites=true&w=majority
```

Se estiver assim, o Prisma vai reclamar porque não tem banco definido:

```txt
mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/?appName=cluster
```

## Uploads com Vercel Blob

Para as imagens funcionarem em produção na Vercel, crie um Storage do tipo **Blob** no painel da Vercel e adicione a variável:

```env
BLOB_READ_WRITE_TOKEN="seu-token-read-write-do-vercel-blob"
```

Quando essa variável existe, os endpoints de upload salvam as imagens otimizadas em `.webp` no Blob, em caminhos como:

```txt
uploads/products/nome-da-imagem.webp
uploads/drops/nome-da-imagem.webp
```

Em desenvolvimento local, se o token não existir, o upload continua salvando em `public/uploads`.

## Como rodar localmente

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

Admin:

```txt
http://localhost:3000/admin
```

## Como testar o Lenis e as animações

1. Rode `npm run dev`.
2. Abra a home.
3. Role a página no mouse/trackpad.
4. Confira se o scroll está mais fluido.
5. Veja se textos, fotos, manifesto e produtos aparecem progressivamente.
6. Ative `prefers-reduced-motion` no sistema/navegador e confirme que o site continua utilizável com movimento reduzido.

Arquivos principais:

```txt
app/plugins/lenis.client.ts
app/composables/useRevealOnScroll.ts
app/assets/css/main.css
```

## Como testar o WhatsApp

1. Configure `WHATSAPP_NUMBER` no `.env` com DDI + DDD + número.
2. Rode o projeto.
3. Acesse `/produtos`.
4. Abra uma peça.
5. Escolha tamanho, cor/variação e quantidade.
6. Clique em **Quero essa aqui**.
7. O WhatsApp deve abrir com uma mensagem parecida com:

```txt
Salve! Vi essa peça no site do Edificio 118 e curti demais.

Peça: [nome]
Tamanho: [tamanho]
Cor/Variação: [cor]
Quantidade: [quantidade]
Valor: [valor]
Link: [link]

Consegue me ajudar a fechar essa?
```

O botão bloqueia se faltar tamanho, cor/variação, estoque, quantidade válida ou se `allowWhatsapp` estiver desativado.

## Estrutura principal

```txt
app/
  components/
    admin/
    shop/
  composables/
    useRevealOnScroll.ts
  plugins/
    lenis.client.ts
  pages/
    index.vue
    produtos/index.vue
    produto/[slug].vue
    admin/
server/
  api/admin
  api/shop
  utils
  validators
prisma/
  schema.prisma
  seed.ts
public/
  images/editorial
  uploads/products
shared/types
```

## Admin

O admin mantém as regras principais:

- acesso somente por `/admin`;
- senha por `ADMIN_SENHA`;
- sessão com cookie HTTP-only;
- sem link público para o admin;
- CRUD de produtos, categorias e materiais;
- upload com Sharp;
- validações com Zod;
- dados internos fora da API pública.

## Observações importantes

- O `pnpm-lock.yaml` antigo foi removido porque a dependência `lenis` foi adicionada. Rode `npm install` ou gere um novo lock com o gerenciador que você for usar.
- Configure `NUXT_PUBLIC_SITE_URL` com a URL real em produção para o link enviado no WhatsApp sair certo.
- Em produção na Vercel, configure `BLOB_READ_WRITE_TOKEN`. Com esse token, uploads de produtos e drops são salvos no Vercel Blob e as URLs públicas ficam persistentes. Sem token, o projeto mantém fallback local em `public/uploads` apenas para desenvolvimento.

---

## Rodada admin profissional

A área `/admin` foi reconstruída para funcionar como painel real da loja:

- login com `ADMIN_SENHA`;
- sessão por cookie HTTP-only;
- dashboard financeiro;
- CRUD de produtos, categorias e materiais;
- vendas manuais;
- despesas manuais;
- gráficos;
- relatórios e exportação CSV;
- visual dark inspirado em dashboard profissional.

Depois de baixar esta versão, rode:

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Acesse:

```txt
/admin
```

Use a senha configurada em:

```env
ADMIN_SENHA="sua-senha-admin"
```

## Rodada extra — correção pública + admin

Esta versão corrige a página de novo/editar produto em branco, melhora a responsividade do admin, reduz o risco de scroll horizontal e adiciona exportação de relatório em PDF.

Dependências novas:

```bash
npm install jspdf jspdf-autotable
```

Depois rode:

```bash
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Drops variáveis

O site agora possui um sistema de drops configurável pelo admin.

Fluxo:

1. Acesse `/admin`.
2. Entre em `Drops`.
3. Crie um drop com título, descrição, imagens e textos públicos.
4. Marque como `Drop ativo`. Ao ativar um drop, os outros são desativados automaticamente.
5. Em Produtos, vincule cada peça ao drop desejado ou deixe como `Sem drop`.
6. A home usa o drop destacado e o botão `Ver o drop` abre `/produtos?drop=slug-do-drop`.

Comandos depois de alterar o schema:

```bash
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Produtos publicados e ativos aparecem em `/produtos`. Produtos vinculados a um drop também aparecem quando a URL recebe `?drop=slug-do-drop`.

## Correção: produtos, upload automático e cores de drop

A API pública de produtos foi ajustada para garantir que produtos ativos e publicados apareçam em `/produtos`, inclusive produtos sem drop.

O upload de imagens no admin agora é automático: ao selecionar uma imagem, ela já é enviada e convertida para WEBP com Sharp.

Drops agora possuem `highlightColor`, usado na home para personalizar o botão principal, selos e faixa do drop destacado.

### Novos models

- `SavedColor`
- `Drop.highlightColor`

### Novas APIs admin

- `GET /api/admin/saved-colors`
- `POST /api/admin/saved-colors`
- `DELETE /api/admin/saved-colors/[id]`

### Comandos

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Notas da v4

- O admin usa validação Zod no client e no servidor para mensagens de erro mais claras.
- Produto publicado sem imagem é bloqueado com mensagem amigável.
- A cor do drop destacado passa a controlar a cor de destaque da experiência pública inteira.
- `/produtos` ganhou um rodapé próprio com ação para abrir uma peça aleatória.
- `/produto/[slug]` tem botão de voltar e sugestões com fallback.

## Modelos fotográficos de Drop

A home pública renderiza o drop ativo/padrão conforme `layoutModel`:

- `editorial-building` — Editorial do prédio: mínimo 5 fotos, ideal 6 a 8.
- `horizontal-corridor` — Corredor horizontal: mínimo 6 fotos, ideal 8 a 12.
- `impact-zoom` — Zoom de impacto: mínimo 5 fotos, ideal 7 a 10.
- `memory-wall` — Parede de vivências: mínimo 8 fotos, ideal 12 a 18.
- `drop-archive` — Arquivo do drop: mínimo 10 fotos, ideal 16 a 24 ou mais.

A seção **02 — Aparência pública** do admin permite escolher o modelo, ver preview, conferir campos necessários e validar quantidade de fotos. A ativação do drop bloqueia se o modelo não tiver o mínimo de fotos.

Depois de atualizar o projeto:

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
rm -rf .nuxt
npm run dev
```
