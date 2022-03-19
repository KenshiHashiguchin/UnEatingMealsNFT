export default {
  env: {
    networkType: process.env.NETWORK_TYPE,
    nodeURL: process.env.NODE_URL || 'https://001-joey-dual.symboltest.net:3001',
    servicePublicKey: process.env.SERVICE_PUBLIC_KEY,
    serviceAddress: process.env.SERVICE_ADDRESS,
    supplierAddress: process.env.SUPPLIER_ADDRESS,
  },
  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL || 'http://locahost',
    baseBrowserURL: process.env.BASE_BROWSER_URL || 'http://localhost',
    gameBrowserURL: process.env.GAME_BROWSER_URL || 'http://localhost',
    networkType: process.env.NETWORK_TYPE,
    nodeURL: process.env.NODE_URL || 'https://001-joey-dual.symboltest.net:3001',
    servicePublicKey: process.env.SERVICE_PUBLIC_KEY,
    serviceAddress: process.env.SERVICE_ADDRESS,
    supplierAddress: process.env.SUPPLIER_ADDRESS,
  },
  privateRuntimeConfig: {
    creatorPrivateKey: process.env.CREATOR_PRIVATE_KEY,
    supplierPrivateKey: process.env.SUPPLIER_PRIVATE_KEY,
    networkType: process.env.NETWORK_TYPE,
    nodeURL: process.env.NODE_URL || 'https://001-joey-dual.symboltest.net:3001',
    servicePublicKey: process.env.SERVICE_PUBLIC_KEY,
    serviceAddress: process.env.SERVICE_ADDRESS,
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'UnEatingMeals',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/scss/app.scss',
    '@/assets/css/social/bootstrap-social.css'
  ],

  script: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/axios.ts',
    {src: '~/plugins/nftService'},
    {src: '~/plugins/game', mode: 'client'},
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    'nuxt-fontawesome',
    ['bootstrap-vue/nuxt', { css: false, icons: true}],
    ['cookie-universal-nuxt'],
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, ctx) {
      config.node = {
        fs: 'empty'
      }
    },
    babel: {
      babelrc: false,
      compact: false
    },
    loadingScreen: false
  },

  axios: {
    baseURL: process.env.BASE_URL,
    browserBaseURL: process.env.BASE_BROWSER_BASE_URL,
    proxy: true,
  },

  extensions: ['ts', 'js'],
  // middleware: ['~/middleware/auth.ts'],
  router: {
    middleware: ['auth'],
  },
  serverMiddleware: [
    // "~/server"
  // ]
    { path: '/', handler: '~/backend/index.ts' },
  ]
}
