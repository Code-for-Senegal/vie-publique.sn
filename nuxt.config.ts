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
              'https://www.google.com',
              'https://fonts.googleapis.com',
              'https://*.googleapis.com',
              'https://*.firebaseio.com',
              'https://firebaseinstallations.googleapis.com',
              'https://fcmregistrations.googleapis.com',
              // Cartes (light/dark styles, tiles, sprites, glyphs)
              'https://basemaps.cartocdn.com',
              'https://*.basemaps.cartocdn.com',
              'https://*.cartocdn.com',
              'https://api.maptiler.com',
              'https://fonts.openmaptiles.org',
              // Iconify (chargement dynamique d'icônes par Nuxt UI)
              'https://api.iconify.design',
              // Microsoft Clarity
              'https://www.clarity.ms',
              'https://*.clarity.ms',
            ],
            'script-src': [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              'blob:',
              'https://www.googletagmanager.com',
              'https://www.google-analytics.com',
              'https://platform.twitter.com',
              'https://cdn.syndication.twimg.com',
              'https://connect.facebook.net',
              'https://instant.page',
              'https://www.gstatic.com',
              // Microsoft Clarity
              'https://www.clarity.ms',
            ],
            'script-src-attr': ["'unsafe-inline'", "'unsafe-hashes'"],
            'style-src': [
              "'self'",
              "'unsafe-inline'",
              'https://fonts.googleapis.com',
              // Styles de carte (sprites CARTO)
              'https://basemaps.cartocdn.com',
              'https://*.basemaps.cartocdn.com',
            ],
            'font-src': [
              "'self'",
              'https://fonts.gstatic.com',
              // Glyphes de carte
              'https://fonts.openmaptiles.org',
            ],
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
              // Tuiles / sprites de carte
              'https://basemaps.cartocdn.com',
              'https://*.basemaps.cartocdn.com',
              'https://*.cartocdn.com',
              'https://api.maptiler.com',
            ],
            'frame-src': [
              'https://www.youtube.com',
              'https://www.youtube-nocookie.com',
              'https://platform.twitter.com',
              'https://syndication.twitter.com',
              'https://cms.vie-publique.sn',
              'https://docs.google.com',
            ],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'object-src': ["'none'"],
            'child-src': ["'self'", 'blob:'],
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
  // Force process exit after build to prevent hanging due to open handles
  // (Firebase, Typesense, PWA service worker keep Node.js alive)
  hooks: {
    close: () => {
      setTimeout(() => {
        console.log('\n[build] Forcing process exit (open handles detected)');
        process.exit(0);
      }, 5000);
    },
  },

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
    publicAssets: [
      {
        dir: join(process.cwd(), 'node_modules/pdfjs-dist/wasm'),
        baseURL: '/pdf-worker',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      },
    ],
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
      proxy: `${process.env.CMS_API_URL || 'https://cms.vie-publique.sn'}/assets/**`,
      headers: { 'cache-control': 'max-age=31536000, immutable' },
    },
    '/docs/**': {
      proxy: `${process.env.CMS_API_URL || 'https://cms.vie-publique.sn'}/assets/**`,
      headers: { 'cache-control': 'max-age=86400' },
    },
    // Headers pour les API de fallback
    '/api/**': {
      headers: { 'cache-control': 'no-cache' },
    },
    // Pages carte : désactiver SSR (WebGL client-only)
    '/carte/**': { ssr: false },
    // Redirections SEO
    '/budget': { redirect: { to: '/budget-senegal', statusCode: 301 }, prerender: true },
    '/budget/**': { redirect: { to: '/budget-senegal', statusCode: 301 }, prerender: true },
    '/publications': { redirect: { to: '/actualites', statusCode: 301 }, prerender: true },
    '/publications/**': { redirect: { to: '/actualites', statusCode: 301 }, prerender: true },
    // Redirections des anciennes URLs anglaises vers françaises
    '/about/privacy': {
      redirect: { to: '/a-propos/confidentialite', statusCode: 301 },
      prerender: true,
    },
    '/about/barometre': {
      redirect: { to: '/a-propos/barometre-politique', statusCode: 301 },
      prerender: true,
    },
    '/about/us': {
      redirect: { to: '/a-propos/qui-sommes-nous', statusCode: 301 },
      prerender: true,
    },
    // Apple touch icons (requêtes automatiques iOS)
    '/apple-touch-icon.png': { redirect: '/pwa-192x192.png' },
    '/apple-touch-icon-precomposed.png': { redirect: '/pwa-192x192.png' },
    // Anciennes URLs avec wildcard
    '/reports': { redirect: { to: '/documents/rapports-audit', statusCode: 301 } },
    '/reports/**': { redirect: { to: '/documents/rapports-audit', statusCode: 301 } },
    '/rapport-senegal': { redirect: { to: '/documents/rapports-audit', statusCode: 301 } },
    '/rapport-senegal/**': { redirect: { to: '/documents/rapports-audit', statusCode: 301 } },
    // Journal officiel : consolidation vers /documents/journal-officiel-senegal
    '/journal-officiel-senegal': {
      redirect: { to: '/documents/journal-officiel-senegal', statusCode: 301 },
    },
    '/journal-officiel-senegal/**': {
      redirect: { to: '/documents/journal-officiel-senegal', statusCode: 301 },
    },
    '/documents/journal-officiel': {
      redirect: { to: '/documents/journal-officiel-senegal', statusCode: 301 },
    },
    '/documents/journal-officiel/**': {
      redirect: { to: '/documents/journal-officiel-senegal/**', statusCode: 301 },
    },
    '/budget-etat-senegal': { redirect: { to: '/budget-senegal', statusCode: 301 } },
    '/budget-etat-senegal/**': { redirect: { to: '/budget-senegal/**', statusCode: 301 } },
    '/nomination-senegal/conseil-des-ministres-07-aout': {
      redirect: { to: '/nomination-senegal', statusCode: 301 },
    },
    '/nomination-senegal/conseil-des-ministres-07-aout/**': {
      redirect: { to: '/nomination-senegal/**', statusCode: 301 },
    },
    '/nomination-senegal/conseil-des-ministres-18-juillet': {
      redirect: { to: '/nomination-senegal', statusCode: 301 },
    },
    '/nomination-senegal/conseil-des-ministres-18-juillet/**': {
      redirect: { to: '/nomination-senegal/**', statusCode: 301 },
    },
    '/nomination-senegal/conseil-des-ministres-31-juillet': {
      redirect: { to: '/nomination-senegal', statusCode: 301 },
    },
    '/nomination-senegal/conseil-des-ministres-31-juillet/**': {
      redirect: { to: '/nomination-senegal/**', statusCode: 301 },
    },
    '/publications/recrutement': {
      redirect: { to: '/a-propos/recrutement', statusCode: 301 },
      prerender: true,
    },
    '/conseil-des-ministres/conseil-des-ministres-*': {
      redirect: { to: '/conseil-des-ministres', statusCode: 301 },
    },
    '/medias/liste-officielle': { redirect: { to: '/medias', statusCode: 301 }, prerender: true },
    '/code-senegal': { redirect: { to: '/documents/codes', statusCode: 301 } },
    '/code-senegal/**': { redirect: { to: '/documents/codes', statusCode: 301 } },
    // Legacy /portraits/<slug> : résolu vers /personnalites/<id>/<slug> par le
    // handler serveur server/routes/portraits/[slug].get.ts (lookup slug -> id).
    // Le blanket '/portraits/**' -> '/personnalites/**' renvoyait sur un 404
    // (la route cible est /personnalites/[id]/[slug], 2 segments). Ne PAS le remettre.
    '/portraits': { redirect: { to: '/personnalites-senegal', statusCode: 301 } },
    '/budget-senegal/2024': {
      redirect: { to: '/budget-senegal', statusCode: 301 },
      prerender: true,
    },
    '/budget-senegal/2025': {
      redirect: { to: '/budget-senegal', statusCode: 301 },
      prerender: true,
    },
    // Anciennes URLs PDF → pages documents
    '/pdf/budget/2024-lois-de-finances-2023-18.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2024-loi-de-finances-annexes.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2024-rapport-execution-budgetaire-premier-trimestre.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2024-rapport-execution-budgetaire-deuxieme-trimestre.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2025-projet-loi-de-finance-initiale.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2025-projet-loi-de-finance-initiale-annexes-voies-et-moyens.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2025-document-budgetaire-genre.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/budget/2024-LFR-loi-de-finances-rectificative-2024-scan-compressed.pdf': {
      redirect: { to: '/documents/budget', statusCode: 301 },
    },
    '/pdf/jors/**': { redirect: { to: '/documents/journal-officiel-senegal', statusCode: 301 } },
    '/pdf/textes/Decret-2024-940.pdf': {
      redirect: {
        to: '/documents/551/decret-2024-940-portant-repartition-des-services-de-letat',
        statusCode: 301,
      },
    },
    '/pdf/programmes/senegal-2050-brochure.pdf': {
      redirect: { to: '/documents/415/senegal-2050', statusCode: 301 },
    },
    '/pdf/programmes/senegal-2050-brochure_compressed.pdf': {
      redirect: { to: '/documents/415/senegal-2050', statusCode: 301 },
    },
    '/pdf/programmes/etats-generaux-industrie-commerce-pre-rappord-diagnostic-industrialisation.pdf':
      { redirect: { to: '/actualites/133/etats-generaux-industrie-commerce', statusCode: 301 } },
    '/pdf/justice/arrete-7934-du-31-mai-2016-relatif-au-bareme-de-remunerations-des-mandataires-judiciaires.pdf':
      { redirect: { to: '/documents/1402/JO-6937-du-02-juin-2016', statusCode: 301 } },
    '/pdf/communiques/reunion-interministerielle-rentree-scolaire-2024-2025.pdf': {
      redirect: {
        to: '/actualites/136/reunion-interministerielle-rentree-scolaire-2024-2025',
        statusCode: 301,
      },
    },
  },

  // Optimisations Vite pour le bundling (simplifiées pour éviter les conflits)
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      modulePreload: { polyfill: false }, // Désactive le modulepreload polyfill qui cause des problèmes sur Windows avec Nuxt 4
    },
    optimizeDeps: {
      include: [
        'maplibre-gl',
        '@deck.gl/core',
        '@deck.gl/layers',
        '@deck.gl/geo-layers',
        '@deck.gl/aggregation-layers',
        '@deck.gl/mapbox',
        'supercluster',
      ],
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

    // Configuration Sunu Election
    sunuElectionApiUrl: process.env.SUNU_ELECTION_API_URL,
    sunuElectionApiKey: process.env.SUNU_ELECTION_API_KEY,

    // Configuration SMTP pour Nodemailer
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpSecure: process.env.SMTP_SECURE,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpFromEmail: process.env.SMTP_FROM_EMAIL,
    brevoApiUrl: process.env.BREVO_API_URL,
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoListId: process.env.BREVO_LIST_ID,

    // Firebase Admin (server-side only)
    firebaseServiceAccountJson: process.env.NUXT_FIREBASE_SERVICE_ACCOUNT_JSON,

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showBarometer: process.env.PUBLIC_SHOW_BAROMETER,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS,
      fbPixelId: process.env.FACEBOOK_PIXEL_ID || '',
      bictorysPublicKey: process.env.BICTORYS_PUBLIC_KEY,
      // Firebase (Push Notifications)
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      firebaseVapidKey: process.env.NUXT_PUBLIC_FIREBASE_VAPID_KEY,
      // Feature Flags
      appEnv: process.env.NUXT_PUBLIC_APP_ENV || 'production',
      featureFlagsEnabled: process.env.NUXT_FEATURE_FLAGS_ENABLED !== 'false',
      // Informations de version de l'application
      appVersion: packageJson.version,
      buildTime: buildTime,
      gitCommit: gitCommit,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  },
  css: ['~/assets/css/app.css', 'maplibre-gl/dist/maplibre-gl.css'],
  colorMode: {
    preference: 'dark', // default value of $nuxt.colorMode.preference
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
      // Note: @vite-pwa/nuxt injecte automatiquement <link rel="manifest">
      // Ne PAS l'ajouter manuellement ici (doublon sinon)
      link: [],
      meta: [
        {
          name: 'keywords',
          content:
            'journal officiel Sénégal, lois décrets Sénégal, documents officiels, budget Sénégal, conseil des ministres, nominations, OFNAC, Cour des Comptes, IGE, ARMP, CENTIF',
        },
        {
          name: 'description',
          content:
            "Accédez aux documents officiels du Sénégal : journal officiel, lois, décrets, codes juridiques, budget, rapports d'audit OFNAC et Cour des Comptes, nominations et travaux parlementaires.",
        },
        // Open Graph Meta Tags
        {
          property: 'og:title',
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        {
          property: 'og:description',
          content:
            "Accédez aux documents officiels du Sénégal : journal officiel, lois, décrets, budget, rapports d'audit OFNAC et Cour des Comptes, nominations et travaux parlementaires.",
        },
        {
          name: 'og:locale',
          content: 'fr_FR',
        },
        {
          property: 'og:image',
          content: 'https://www.vie-publique.sn/images/share-linkedin.png',
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
          content: 'https://www.vie-publique.sn',
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
            "Documents officiels du Sénégal : journal officiel, lois, décrets, budget, rapports d'audit OFNAC et Cour des Comptes, nominations et travaux parlementaires.",
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://www.vie-publique.sn/images/share-linkedin.png' },
      ],
      script: [
        {
          type: 'module',
          src: '//instant.page/5.1.1',
          integrity: 'sha384-MWfCL6g1OTGsbSwfuMHc8+8J2u71/LA8dzlIN3ycajckxuZZmF+DNjdm7O6H3PSq',
        },
        ...(process.env.CLARITY_PROJECT_ID
          ? [
              {
                key: 'microsoft-clarity',
                innerHTML: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${process.env.CLARITY_PROJECT_ID}");`,
              },
            ]
          : []),
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
    // La recherche interne est noindex (règle SEO §10 CLAUDE.md) → hors sitemap
    exclude: ['/recherche'],
  },

  // Robots.txt
  robots: {
    allow: '/',
    disallow: [
      '/budget-senegal/old',
      '/financial-scandals',
      '/publications/enquetes',
      '/publications/institutions',
      '/barometre-politique',
      '/elections/legislatives/resultats/global',
      '/publications/recrutement',
      '/quiz',
      '/chatbot',
      '/chat-bot',
      '/etat-senegal/annuaire',
      '/a-propos/barometre-politique',
      '/a-propos/charte-dons',
      '/don/bictorys',
      '/don/success',
      '/dashboard/**',
      '/projets-publics-senegal',
      '/projets-publics-senegal/**',
    ],
    sitemap: '/sitemap.xml',
  },

  // Schema.org
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Vie Publique Sénégal',
      url: 'https://www.vie-publique.sn',
      logo: 'https://www.vie-publique.sn/social-image.png',
    },
  },
  gtag: {
    enabled: !!process.env.GTAG_ID,
    id: process.env.GTAG_ID,
  },
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
  },
  /* PWA options */
  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    manifest: {
      name: 'Vie Publique Sénégal',
      short_name: 'Vie Publique',
      start_url: '/?utm_medium=PWA&utm_source=launcher',
      id: '/?utm_medium=PWA&utm_source=launcher',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#fff',
      theme_color: '#ffffff',
      gcm_sender_id: '103953800507',
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
    // Note: avec strategies: 'injectManifest', les options workbox
    // (clientsClaim, skipWaiting, navigateFallback) sont IGNORÉES.
    // Le SW custom (sw.ts) gère tout directement.
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      cleanupOutdatedCaches: true,
    },
    injectManifest: {
      // Precache UNIQUEMENT les assets essentiels (icônes, favicon).
      // Les JS/CSS hashés (/_nuxt/*) sont gérés par CacheFirst en runtime :
      // cache miss → réseau → cache. Pas besoin de les precacher.
      // Precacher tout JS/CSS ralentit l'installation du SW et si un seul
      // fichier échoue → le SW ne s'installe pas → l'ancien reste actif.
      globPatterns: ['**/*.{png,svg,ico,webp}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
