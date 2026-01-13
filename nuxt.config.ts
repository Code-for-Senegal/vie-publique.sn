import { readFileSync } from 'fs';
import { join } from 'path';

// Lire la version depuis package.json
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));

// Variables de build
const buildTime = new Date().toISOString();
const gitCommit =
  process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.GIT_COMMIT || null; // null au lieu de 'unknown' pour les conditions

const securityConfig =
  process.env.NODE_ENV === 'production'
    ? {
        // Configuration stricte pour la production
        headers: {
          crossOriginEmbedderPolicy: false,
          crossOriginOpenerPolicy: 'same-origin',
          crossOriginResourcePolicy: 'same-origin',
          xFrameOptions: 'DENY',
          xContentTypeOptions: 'nosniff',
          referrerPolicy: 'strict-origin-when-cross-origin',
          contentSecurityPolicy: {
            'default-src': ["'self'"],
            'connect-src': [
              "'self'",
              'https://*.vie-publique.sn',
              'https://www.google-analytics.com',
              'https://*.google-analytics.com',
              'https://fonts.googleapis.com',
            ],
            'script-src': [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              'https://www.googletagmanager.com',
              'https://www.google-analytics.com',
              'https://platform.twitter.com',
              'https://cdn.syndication.twimg.com',
              'https://connect.facebook.net',
              'https://instant.page',
            ],
            'script-src-attr': ["'unsafe-inline'", "'unsafe-hashes'"],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'img-src': [
              "'self'",
              'data:',
              'https:',
              'https://cms.vie-publique.sn',
              'https://www.google-analytics.com',
              'https://*.google-analytics.com',
              'https://www.googletagmanager.com',
              'https://www.facebook.com',
              'https://*.facebook.com',
              'https://pbs.twimg.com',
              'https://syndication.twitter.com',
            ],
            'frame-src': [
              'https://www.youtube.com',
              'https://platform.twitter.com',
              'https://syndication.twitter.com',
              'https://cms.vie-publique.sn',
            ],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'object-src': ["'none'"],
            'worker-src': ["'self'", 'blob:'],
            'report-uri': ['/api/csp-report'],
          },
          strictTransportSecurity: {
            maxAge: 31536000,
            includeSubdomains: true,
          },
        },
        rateLimiter: {
          tokensPerInterval: 60,
          interval: 'minute',
        },
      }
    : {
        // Configuration permissive pour le développement
        headers: false, // Désactive complètement les en-têtes de sécurité en développement
        rateLimiter: false, // Désactive le rate limiter en développement
      };

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  // Optimisations de build pour réduire le temps
  nitro: {
    prerender: {
      routes: process.env.NITRO_PRERENDER_ROUTES === 'false' ? [] : [],
    },
    minify: true,
    sourceMap: false,
    compressPublicAssets: true,
    node: {
      asyncContext: true,
    },
    externals: {
      defu: 'defu',
    },
    // Configuration proxy pour les images et fichiers en développement
    devProxy: process.env.CMS_API_URL
      ? {
          '/cms': {
            target: `${process.env.CMS_API_URL}/assets`,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/cms/, ''),
          },
          '/docs': {
            target: `${process.env.CMS_API_URL}/assets`,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/docs/, ''),
          },
        }
      : {},
  },

  // Configuration hybride : routeRules + fallback API
  routeRules: {
    // Essayer routeRules en premier
    '/cms/**': {
      proxy: `https://cms.vie-publique.sn/assets/**`,
      headers: { 'cache-control': 'max-age=31536000, immutable' },
    },
    '/docs/**': {
      proxy: `https://cms.vie-publique.sn/assets/**`,
      headers: { 'cache-control': 'max-age=86400' },
    },
    // Headers pour les API de fallback
    '/api/**': {
      headers: { 'cache-control': 'no-cache' },
    },
    // Redirections SEO
    '/budget': { redirect: { to: '/budget-senegal', statusCode: 301 }, prerender: true },
    '/publications/**': { redirect: { to: '/actualites', statusCode: 301 }, prerender: true },
    // Redirections des anciennes URLs anglaises vers françaises
    '/about/privacy': { redirect: '/a-propos/confidentialite', prerender: true },
    '/about/barometre': { redirect: '/a-propos/barometre-politique', prerender: true },
  },

  // Optimisations Vite pour le bundling (simplifiées pour éviter les conflits)
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      modulePreload: { polyfill: false }, // Désactive le modulepreload polyfill qui cause des problèmes sur Windows avec Nuxt 4
    },
    server: {
      fs: {
        // Autorise l'accès aux fichiers hors du dossier racine
        strict: false,
        // Autorise explicitement le dossier node_modules
        allow: [process.cwd(), `${process.cwd()}/node_modules`],
      },
    },
  },

  // FIXME
  // Optimisations expérimentales désactivées pour éviter les conflits
  // experimental: {
  //   payloadExtraction: false,
  //   treeshakeClientOnly: true,
  //   inlineSSRStyles: false
  // },

  typescript: {
    shim: false,
    strict: false,
    typeCheck: false,
  },
  ssr: true,
  modules: [
    '@nuxt/ui',
    'nuxt-gtag',
    '@nuxtjs/seo',
    // FIXME? Temporairement désactivé - incompatible avec Nuxt 4
    // '@nuxtjs/web-vitals',
    '@nuxt/image',
    '@vueuse/motion/nuxt',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/leaflet',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/mdc',
    'nuxt-security',
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    // Variables privées (côté serveur uniquement)
    typesenseApiKey: process.env.TYPESENSE_API_KEY,
    typesenseUrl: process.env.TYPESENSE_URL,
    typesenseCollection: process.env.TYPESENSE_COLLECTION,
    cmsApiUrl: process.env.CMS_API_URL,
    cmsApiKey: process.env.CMS_API_KEY,
    bictorysApiKey: process.env.BICTORYS_API_KEY,
    bictorysApiUrl: process.env.BICTORYS_API_URL,
    bictorysWebhookSecret: process.env.BICTORYS_WEBHOOK_SECRET,

    // Configuration Paydunya
    paydunyaMasterKey: process.env.PAYDUNYA_MASTER_KEY,
    paydunyaPrivateKey: process.env.PAYDUNYA_PRIVATE_KEY,
    paydunyaToken: process.env.PAYDUNYA_TOKEN,
    paydunyaApiUrl: process.env.PAYDUNYA_API_URL,

    // Configuration SMTP pour Nodemailer
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpFromEmail: process.env.SMTP_FROM_EMAIL,

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showBarometer: process.env.PUBLIC_SHOW_BAROMETER,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS,
      brevoApiKey: process.env.BREVO_API_KEY,
      brevoListId: process.env.BREVO_LIST_ID,
      sunuElectionApiUrl: process.env.SUNU_ELECTION_API_URL,
      sunuElectionApiKey: process.env.SUNU_ELECTION_API_KEY,
      cmsLocalApiUrl: process.env.LOCAL_CMS_API_URL,
      fbPixelId: process.env.FACEBOOK_PIXEL_ID || '',
      maintenanceMode: process.env.NUXT_PUBLIC_MAINTENANCE_MODE === 'true',
      bictorysPublicKey: process.env.BICTORYS_PUBLIC_KEY,
      // Feature Flags
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'production',
      featureFlagsEnabled: process.env.NUXT_FEATURE_FLAGS_ENABLED !== 'false',
      // Informations de version de l'application
      appVersion: packageJson.version,
      buildTime: buildTime,
      gitCommit: gitCommit,
      nodeEnv: process.env.NODE_ENV || 'development',
      redirects: [
        { from: '^/reports(.*)', to: '/rapport-senegal$1' },
        { from: '^/budget-etat-senegal(.*)', to: '/budget-senegal$1' },
        {
          from: '^/nomination-senegal/conseil-des-ministres-07-aout(.*)',
          to: '/nomination-senegal$1',
        },
        {
          from: '^/nomination-senegal/conseil-des-ministres-18-juillet(.*)',
          to: '/nomination-senegal$1',
        },
        {
          from: '^/nomination-senegal/conseil-des-ministres-31-juillet(.*)',
          to: '/nomination-senegal$1',
        },
        {
          from: '/about/us',
          to: '/a-propos/qui-sommes-nous',
        },
        {
          from: '/publications/recrutement',
          to: '/a-propos/recrutement',
        },
        {
          from: '^/conseil-des-ministres/conseil-des-ministres-[\\w-]+$',
          to: '/conseil-des-ministres',
        },
        {
          from: '/medias/liste-officielle',
          to: '/medias',
        },
        {
          from: '/code-senegal',
          to: '/documents/codes',
        },
        {
          from: '/portraits(.*)',
          to: '/personnalites$1',
        },
        {
          from: '/budget-senegal/2024',
          to: '/budget-senegal',
        },
        {
          from: '/budget-senegal/2025',
          to: '/budget-senegal',
        },
        {
          from: '/pdf/budget/2024-lois-de-finances-2023-18.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2024-loi-de-finances-annexes.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2024-rapport-execution-budgetaire-premier-trimestre.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2024-rapport-execution-budgetaire-deuxieme-trimestre.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2025-projet-loi-de-finance-initiale.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2025-projet-loi-de-finance-initiale-annexes-voies-et-moyens.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2025-document-budgetaire-genre.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/budget/2024-LFR-loi-de-finances-rectificative-2024-scan-compressed.pdf',
          to: '/documents/budget',
        },
        {
          from: '/pdf/jors/(.*)',
          to: '/documents/journal-officiel',
        },
        {
          from: '/pdf/textes/Decret-2024-940.pdf',
          to: '/documents/551/decret-2024-940-portant-repartition-des-services-de-letat',
        },
        {
          from: '/pdf/programmes/senegal-2050-brochure.pdf',
          to: '/documents/415/senegal-2050',
        },
        {
          from: '/pdf/programmes/senegal-2050-brochure_compressed.pdf',
          to: '/documents/415/senegal-2050',
        },
        {
          from: '/pdf/programmes/etats-generaux-industrie-commerce-pre-rappord-diagnostic-industrialisation.pdf',
          to: '/actualites/133/etats-generaux-industrie-commerce',
        },
        {
          from: '/pdf/justice/arrete-7934-du-31-mai-2016-relatif-au-bareme-de-remunerations-des-mandataires-judiciaires.pdf',
          to: '/documents/1402/JO-6937-du-02-juin-2016',
        },
        {
          from: '/pdf/communiques/reunion-interministerielle-rentree-scolaire-2024-2025.pdf',
          to: '/actualites/136/reunion-interministerielle-rentree-scolaire-2024-2025',
        },
      ],
    },
  },
  css: ['~/assets/css/app.css'],
  colorMode: {
    preference: 'light', // default value of $nuxt.colorMode.preference
  },
  tailwindcss: {
    configPath: './tailwind.config.ts',
    quiet: true, // Supprime les warnings
  },
  app: {
    head: {
      titleTemplate: '%s | Vie-Publique.sn',
      title: "l'information publique au Sénégal | Vie-Publique.sn",
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
      meta: [
        {
          name: 'keywords',
          content:
            'République Sénégal gouvernement Diomaye Sonko journal officiel rapports OFNAC Cours des Comptes IGE ARMP CENTIF',
        },
        {
          name: 'description',
          content:
            "République du Sénégal, Gouvernement, nominations, journal officiel, rapports d'audit OFNAC Cours des Compte, Diomaye Faye, Ousmane SOnko",
        },
        // Open Graph Meta Tags
        {
          property: 'og:title',
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        {
          property: 'og:description',
          content:
            "République du Sénégal, Gouvernement Diomaye Faye et Ousmane Sonko, nominations, journal officiel, rapports d'audit OFNAC Cours des Compte",
        },
        {
          name: 'og:locale',
          content: 'fr_FR',
        },
        {
          property: 'og:image',
          content: 'https://vie-publique.sn/images/share-linkedin.png',
        },
        {
          property: 'og:image:type',
          content: 'image/png',
        },
        {
          property: 'og:image:width',
          content: '1353',
        },
        {
          property: 'og:image:height',
          content: '1082',
        },
        {
          property: 'og:url',
          content: 'https://vie-publique.sn',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:site_name',
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        // Twitter Card Meta Tags
        {
          name: 'twitter:title',
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        {
          name: 'twitter:description',
          content:
            "Gouvernement du Sénégal, nominations de Diomaye et Sonko, journal officiel, rapports d'audit OFNAC Cours des Comptes",
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/images/share-linkedin.png' },
      ],
      script: [
        {
          type: 'module',
          src: '//instant.page/5.1.1',
          integrity: 'sha384-MWfCL6g1OTGsbSwfuMHc8+8J2u71/LA8dzlIN3ycajckxuZZmF+DNjdm7O6H3PSq',
        },
      ],
    },
  },
  security: securityConfig as any,
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.vie-publique.sn',
    name: 'Vie Publique Sénégal',
    description: "L'information publique au Sénégal | Vie-Publique.sn",
    defaultLocale: 'fr',
    // Nuxt SEO désactive automatiquement l'indexation si env !== 'production'
    env: process.env.NUXT_SITE_ENV || 'production',
  },

  // Sitemap dynamique
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },

  // Robots.txt
  robots: {
    allow: '/',
    disallow: [
      '/journal-officiel-senegal/v2',
      '/journal-officiel-senegal/v3',
      '/budget-senegal/old',
      '/financial-scandals',
      '/individuals-cited',
      '/publications/enquetes',
      '/publications/institutions',
      '/barometre-politique',
      '/elections/legislatives/resultats/global',
      '/publications/recrutement',
      '/quiz',
      '/chatbot',
      '/chat-bot',
      '/gouvernement-senegal',
      '/etat-senegal/annuaire',
      '/etat-senegal/organisation',
      '/a-propos/barometre-politique',
      '/a-propos/charte-dons',
      '/don/bictorys',
      '/don/paydunya',
      '/don/success',
    ],
    sitemap: '/sitemap.xml',
  },

  // Schema.org
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Vie Publique Sénégal',
      url: 'https://vie-publique.sn',
      logo: 'https://vie-publique.sn/social-image.png',
    },
  },
  gtag: {
    enabled: !!process.env.GTAG_ID,
    id: process.env.GTAG_ID,
  },
  // FIXME web-vitals: incompatible avec Nuxt 4? Temporarily disabled
  // webVitals: {
  //   provider: 'ga',
  //   disabled: !process.env.GTAG_ID,
  //   ga: { id: process.env.GTAG_ID },
  // },
  image: {
    // Provider pour les images locales et du proxy
    providers: {
      cms: {
        provider: './app/providers/cms-image.ts',
        options: {
          baseURL: '/cms',
        },
      },
    },
    // Domaines autorisés pour l'optimisation
    domains: ['localhost', 'vie-publique.sn', 'www.vie-publique.sn'],
    // Alias pour simplifier l'usage
    alias: {
      cms: '/cms',
    },
    directus: {
      // This URL needs to include the final `assets/` directory
      baseURL: process.env.CMS_API_URL_ASSETS,
    },
  },
  /* PWA options */
  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    manifest: {
      name: 'Vie Publique SN',
      short_name: 'ViePubliqueSN',
      start_url: '/?utm_medium=PWA&utm_source=launcher',
      id: '/?utm_medium=PWA&utm_source=launcher',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#fff',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-256x256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-1024x1024.png',
          sizes: '1024x1024',
          type: 'image/png',
        },
        {
          src: 'pwa-1024x1024.png',
          sizes: '1024x1024',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'pwa-1024x1024.png',
          sizes: '1024x1024',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      description: "L'information publique au Sénégal",
      lang: 'fr',
      categories: [
        'informations',
        'politiques',
        'gouvernement du sénégal',
        'bonne gouvernance',
        'Etat',
      ],
      screenshots: [
        {
          src: 'pwa-screenshot1-vpsn.png',
          type: 'image/png',
          sizes: '321x321',
          form_factor: 'narrow',
        },
        {
          src: 'pwa-screenshot2-vpsn.png',
          type: 'image/png',
          sizes: '540x332',
          form_factor: 'narrow',
        },
        {
          src: 'pwa-screenshot5-vpsn.png',
          type: 'image/png',
          sizes: '1024x630',
          form_factor: 'wide',
        },
        {
          src: 'pwa-screenshot3-vpsn.png',
          type: 'image/png',
          sizes: '1024x714',
          form_factor: 'wide',
        },
        {
          src: 'pwa-screenshot4-vpsn.png',
          type: 'image/png',
          sizes: '640x480',
          form_factor: 'wide',
        },
      ],
      share_target: {
        action: '/?utm_medium=PWA&utm_source=share-target&share-target',
        method: 'POST',
        enctype: 'multipart/form-data',
        params: {
          files: [
            {
              name: 'file',
              accept: ['image/*'],
            },
          ],
        },
      },
      // Raccourcis d'écran d'accueil pour accès rapide
      shortcuts: [
        {
          name: 'Actualités',
          short_name: 'Actus',
          description: 'Dernières actualités du Sénégal',
          url: '/actualites?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Budget Sénégal',
          short_name: 'Budget',
          description: 'Budget et finances publiques',
          url: '/budget-senegal?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Assemblée Nationale',
          short_name: 'Assemblée',
          description: 'Députés et travaux parlementaires',
          url: '/assemblee-nationale?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
        {
          name: 'Documents',
          short_name: 'Docs',
          description: 'Documents officiels du gouvernement',
          url: '/documents?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
        },
      ],
      // Fonctionnalités avancées PWA
      display_override: ['standalone', 'minimal-ui'],
      handle_links: 'preferred',
      launch_handler: {
        client_mode: ['navigate-existing', 'auto'],
      },
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      // Routes principales accessibles offline
      navigateFallbackAllowlist: [
        /^\/$/,
        /^\/actualites(\/.*)?$/,
        /^\/budget-senegal(\/.*)?$/,
        /^\/assemblee-nationale(\/.*)?$/,
        /^\/gouvernement(\/.*)?$/,
        /^\/documents(\/.*)?$/,
        /^\/personnalites(\/.*)?$/,
        /^\/conseil-des-ministres(\/.*)?$/,
      ],
      // Exclure les routes qui ne doivent pas être cachées
      navigateFallbackDenylist: [/^\/api\//, /^\/sitemap/, /^\/__nuxt_error/],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      // Désactiver la PWA UNIQUEMENT en local développeur
      enabled: process.env.PWA_ENABLED === 'true',
      suppressWarnings: true,
      navigateFallback: null, // Fix dev-sw.js error (null au lieu de undefined)
      navigateFallbackAllowlist: [],
      type: 'module',
    },
  },
  compatibilityDate: '2025-07-15',
  // Used by the AI Chat to highlight code
  mdc: {
    headings: {
      anchorLinks: false,
    },
    highlight: {
      langs: [
        'ts',
        'js',
        'html',
        'css',
        'json',
        'md',
        'yaml',
        'bash',
        'css',
        'py',
        'tsx',
        'jsx',
        'go',
        'rust',
        'java',
        'kotlin',
        'swift',
        'csharp',
      ],
    },
  },
});
