export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  srcDir: 'app/',
  serverDir: 'server/',

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Edificio 118 — feito pra quem vive o corre',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'O prédio feito pra quem vive o corre. Streetwear autoral baseado em vivências reais.'
        },
        { name: 'theme-color', content: '#070707' }
      ]
    }
  },

  runtimeConfig: {
    adminSenha: process.env.ADMIN_SENHA || '',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || '',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '',
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Edificio 118',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      placeholderImage:
        process.env.NUXT_PUBLIC_PLACEHOLDER_IMAGE ||
        '/images/editorial/corre-com-nos.webp',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '5522999999999'
    }
  },

  compatibilityDate: '2026-05-22',

  routeRules: {
    '/uploads/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    },
    '/images/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    }
  },

  typescript: {
    strict: true
  }
})
