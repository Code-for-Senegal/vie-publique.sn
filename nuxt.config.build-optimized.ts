// Configuration Nuxt optimisée pour des builds plus rapides
export default defineNuxtConfig({
  // Désactiver le prerendering en production pour accélérer le build
  nitro: {
    prerender: {
      routes: process.env.NITRO_PRERENDER_ROUTES === 'false' ? [] : ['/'],
    },
    // Optimisations de build
    minify: true,
    sourceMap: false,
    compressPublicAssets: {
      gzip: false, // Désactiver gzip pendant le build (peut être fait par le CDN)
      brotli: false,
    },
  },

  // Optimisations Vite
  vite: {
    build: {
      // Réduire la taille des chunks
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            ui: ['@nuxt/ui'],
            directus: ['@directus/sdk'],
            charts: ['d3'],
            pdf: ['pdfjs-dist'],
          },
        },
      },
    },
  },

  // Désactiver les features non essentielles pendant le build
  experimental: {
    payloadExtraction: false, // Désactiver pour accélérer
    treeshakeClientOnly: true,
    inlineSSRStyles: false,
  },

  // Optimiser les modules
  modules: [
    // Garder seulement les modules essentiels
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxt/image',
    '@pinia/nuxt',
    // Charger les autres modules conditionnellement
    ...(process.env.NODE_ENV === 'production'
      ? ['@nuxtjs/seo', 'nuxt-security', '@vite-pwa/nuxt']
      : []),
  ],

  // Désactiver devtools en production
  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
  },

  // Optimiser le bundling TypeScript
  typescript: {
    shim: false,
    strict: false, // Désactiver strict pour accélérer
    typeCheck: false, // Vérification des types séparée
  },
});
