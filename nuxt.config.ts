import tailwindTypography from "@tailwindcss/typography";
import { readFileSync } from "fs";
import { join } from "path";

// Lire la version depuis package.json
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8"),
);

// Variables de build
const buildTime = new Date().toISOString();
const gitCommit =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.GIT_COMMIT ||
  null; // null au lieu de 'unknown' pour les conditions

const securityConfig =
  process.env.NODE_ENV === "production"
    ? {
        // Configuration stricte pour la production
        headers: {
          crossOriginEmbedderPolicy: false,
          crossOriginOpenerPolicy: "same-origin",
          crossOriginResourcePolicy: "same-origin",
          xFrameOptions: "DENY",
          xContentTypeOptions: "nosniff",
          referrerPolicy: "strict-origin-when-cross-origin",
          contentSecurityPolicy: {
            "default-src": ["'self'"],
            "connect-src": [
              "'self'",
              "https://*.vie-publique.sn",
              "https://www.google-analytics.com",
              "https://*.google-analytics.com",
              "https://fonts.googleapis.com",
            ],
            "script-src": [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              "https://www.googletagmanager.com",
              "https://www.google-analytics.com",
              "https://platform.twitter.com",
              "https://cdn.syndication.twimg.com",
              "https://connect.facebook.net",
              "https://instant.page",
            ],
            "style-src": [
              "'self'",
              "'unsafe-inline'",
              "https://fonts.googleapis.com",
            ],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "https://cms.vie-publique.sn"],
            "frame-src": [
              "https://www.youtube.com",
              "https://platform.twitter.com",
              "https://syndication.twitter.com",
              "https://cms.vie-publique.sn",
            ],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'none'"],
            "object-src": ["'none'"],
            "worker-src": ["'self'", "blob:"],
            "report-uri": ["/api/csp-report"],
          },
          strictTransportSecurity: {
            maxAge: 31536000,
            includeSubdomains: true,
          },
        },
        rateLimiter: {
          tokensPerInterval: 60,
          interval: "minute",
        },
      }
    : {
        // Configuration permissive pour le développement
        headers: false, // Désactive complètement les en-têtes de sécurité en développement
        rateLimiter: false, // Désactive le rate limiter en développement
      };

export default defineNuxtConfig({
  // Optimisations de build pour réduire le temps
  nitro: {
    prerender: {
      routes: process.env.NITRO_PRERENDER_ROUTES === "false" ? [] : [],
    },
    minify: true,
    sourceMap: false,
    compressPublicAssets: true,
    node: {
      asyncContext: true,
    },
    externals: {
      defu: "defu",
    },
    // Configuration proxy pour les images et fichiers en développement
    devProxy: process.env.CMS_API_URL
      ? {
          "/medias": {
            target: `${process.env.CMS_API_URL}/assets`,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/medias/, ""),
          },
          "/documents": {
            target: `${process.env.CMS_API_URL}/assets`,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/documents/, ""),
          },
        }
      : {},
  },

  // Configuration hybride : routeRules + fallback API
  routeRules: {
    // Essayer routeRules en premier
    "/medias/**": {
      proxy: `https://cms.vie-publique.sn/assets/**`,
      headers: { "cache-control": "max-age=31536000, immutable" },
    },
    "/docs/**": {
      proxy: `https://cms.vie-publique.sn/assets/**`,
      headers: { "cache-control": "max-age=86400" },
    },
    // Headers pour les API de fallback
    "/api/**": {
      headers: { "cache-control": "no-cache" },
    },
  },

  // Optimisations Vite pour le bundling (simplifiées pour éviter les conflits)
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },

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
    "@nuxt/ui",
    "@nuxt/content",
    "nuxt-gtag",
    "@nuxtjs/seo",
    "@nuxtjs/web-vitals",
    "@nuxt/image",
    "@vueuse/motion/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxtjs/leaflet",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/mdc",
    "nuxt-security",
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    // Variables privées (côté serveur uniquement)
    typesenseApiKey: process.env.TYPESENSE_API_KEY,
    typesenseUrl: process.env.TYPESENSE_URL,
    typesenseCollection:
      process.env.TYPESENSE_COLLECTION || "vie-publique-senegal",

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showBarometer: process.env.PUBLIC_SHOW_BAROMETER,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS,
      brevoApiKey: process.env.BREVO_API_KEY,
      brevoListId: process.env.BREVO_LIST_ID,
      cmsApiUrl: process.env.CMS_API_URL,
      cmsApiKey: process.env.CMS_API_KEY,
      sunuElectionApiUrl: process.env.SUNU_ELECTION_API_URL,
      sunuElectionApiKey: process.env.SUNU_ELECTION_API_KEY,
      fbPixelId: process.env.FACEBOOK_PIXEL_ID || "",
      maintenanceMode: process.env.NUXT_PUBLIC_MAINTENANCE_MODE === "true",
      // Informations de version de l'application
      appVersion: packageJson.version,
      buildTime: buildTime,
      gitCommit: gitCommit,
      nodeEnv: process.env.NODE_ENV || "development",
      redirects: [
        { from: "^/reports(.*)", to: "/rapport-senegal$1" },
        { from: "^/budget-etat-senegal(.*)", to: "/budget-senegal$1" },
        {
          from: "^/nomination-senegal/conseil-des-ministres-07-aout(.*)",
          to: "/nomination-senegal$1",
        },
        {
          from: "^/nomination-senegal/conseil-des-ministres-18-juillet(.*)",
          to: "/nomination-senegal$1",
        },
        {
          from: "^/nomination-senegal/conseil-des-ministres-31-juillet(.*)",
          to: "/nomination-senegal$1",
        },
        {
          from: "/about/us",
          to: "/a-propos/qui-sommes-nous",
        },
        {
          from: "/publications/recrutement",
          to: "/a-propos/recrutement",
        },
        {
          from: "^/conseil-des-ministres/conseil-des-ministres-[\\w-]+$",
          to: "/conseil-des-ministres",
        },
        {
          from: "/medias/liste-officielle",
          to: "/medias",
        },
        {
          from: "/code-senegal",
          to: "/documents/codes",
        },
        {
          from: "/pdf/jors/(.*)",
          to: "/documents/journal-officiel",
        },
        {
          from: "/pdf/textes/Decret-2024-940.pdf",
          to: "/documents/551/decret-2024-940-portant-repartition-des-services-de-letat",
        },
        {
          from: "/pdf/programmes/senegal-2050-brochure.pdf",
          to: "/documents/415/senegal-2050",
        },
        {
          from: "/pdf/programmes/senegal-2050-brochure_compressed.pdf",
          to: "/documents/415/senegal-2050",
        },
        {
          from: "/pdf/programmes/etats-generaux-industrie-commerce-pre-rappord-diagnostic-industrialisation.pdf",
          to: "/actualites/133/etats-generaux-industrie-commerce",
        },
        {
          from: "/pdf/justice/arrete-7934-du-31-mai-2016-relatif-au-bareme-de-remunerations-des-mandataires-judiciaires.pdf",
          to: "/documents/1402/JO-6937-du-02-juin-2016",
        },
        {
          from: "/pdf/communiques/reunion-interministerielle-rentree-scolaire-2024-2025.pdf",
          to: "/actualites/136/reunion-interministerielle-rentree-scolaire-2024-2025",
        },
      ],
    },
  },
  css: ["~/assets/css/app.css"],
  colorMode: {
    preference: "dark", // default value of $nuxt.colorMode.preference
  },
  tailwindcss: {
    config: {
      plugins: [tailwindTypography],
    },
  },
  content: {
    defaultLocale: "fr",
    experimental: {
      search: true,
      payloadExtraction: true,
      renderJsonPayloads: true,
    },
  },
  app: {
    head: {
      titleTemplate: "%s | Vie-Publique.sn",
      title: "l'information publique au Sénégal | Vie-Publique.sn",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          name: "keywords",
          content:
            "République Sénégal gouvernement Diomaye Sonko journal officiel rapports OFNAC Cours des Comptes IGE ARMP CENTIF",
        },
        {
          name: "description",
          content:
            "République du Sénégal, Gouvernement, nominations, journal officiel, rapports d'audit OFNAC Cours des Compte, Diomaye Faye, Ousmane SOnko",
        },
        // Open Graph Meta Tags
        {
          property: "og:title",
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        {
          property: "og:description",
          content:
            "République du Sénégal, Gouvernement Diomaye Faye et Ousmane Sonko, nominations, journal officiel, rapports d'audit OFNAC Cours des Compte",
        },
        {
          name: "og:locale",
          content: "fr_FR",
        },
        {
          property: "og:image",
          content: "https://vie-publique.sn/images/share-linkedin.png",
        },
        {
          property: "og:image:type",
          content: "image/png",
        },
        {
          property: "og:image:width",
          content: "1353",
        },
        {
          property: "og:image:height",
          content: "1082",
        },
        {
          property: "og:url",
          content: "https://vie-publique.sn",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        // Twitter Card Meta Tags
        {
          name: "twitter:title",
          content: "l'information publique au Sénégal | Vie-Publique.sn",
        },
        {
          name: "twitter:description",
          content:
            "Gouvernement du Sénégal, nominations de Diomaye et Sonko, journal officiel, rapports d'audit OFNAC Cours des Comptes",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/images/share-linkedin.png" },
      ],
      script: [
        {
          type: "module",
          src: "//instant.page/5.1.1",
          integrity:
            "sha384-MWfCL6g1OTGsbSwfuMHc8+8J2u71/LA8dzlIN3ycajckxuZZmF+DNjdm7O6H3PSq",
        },
      ],
    },
  },
  security: securityConfig as any,
  site: {
    defaultLocale: "fr",
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://www.vie-publique.sn",
    name: "vie-publique.sn",
  },
  // seo: {
  //   sitemap: {
  //     enabled: true,
  //     hostname: process.env.NUXT_PUBLIC_SITE_URL,
  //     exclude: ["/admin/**"], // Exclusion des routes non publiques
  //     routes: async () => {
  //       // Ajoutez ici vos routes dynamiques si besoin
  //       return [];
  //     },
  //   },
  // },
  gtag: {
    enabled: !!process.env.GTAG_ID,
    id: process.env.GTAG_ID,
  },
  webVitals: {
    provider: "ga",
    disabled: !process.env.GTAG_ID,
    ga: { id: process.env.GTAG_ID },
  },
  image: {
    // Provider pour les images locales et du proxy
    providers: {
      cms: {
        provider: "~/providers/cms-image.ts",
        options: {
          baseURL: "/medias",
        },
      },
    },
    // Domaines autorisés pour l'optimisation
    domains: ["localhost", "vie-publique.sn"],
    // Alias pour simplifier l'usage
    alias: {
      cms: "/medias",
    },
    directus: {
      // This URL needs to include the final `assets/` directory
      baseURL: process.env.CMS_API_URL_ASSETS,
    },
  },
  pwa: {
    strategies: "generateSW",
    srcDir: undefined,
    filename: undefined,
    registerType: "autoUpdate",
    manifest: {
      name: "Vie Publique SN",
      short_name: "ViePubliqueSN",
      start_url: "/?utm_medium=PWA&utm_source=launcher",
      id: "/?utm_medium=PWA&utm_source=launcher",
      display: "standalone",
      orientation: "portrait",
      background_color: "#fff",
      theme_color: "#ffffff",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-256x256.png",
          sizes: "256x256",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-1024x1024.png",
          sizes: "1024x1024",
          type: "image/png",
        },
        {
          src: "pwa-1024x1024.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "pwa-1024x1024.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      description: "L'information publique au Sénégal",
      lang: "fr",
      categories: [
        "informations",
        "politiques",
        "gouvernement du sénégal",
        "bonne gouvernance",
        "Etat",
      ],
      screenshots: [
        {
          src: "pwa-screenshot1-vpsn.png",
          type: "image/png",
          sizes: "321x321",
          form_factor: "narrow",
        },
        {
          src: "pwa-screenshot2-vpsn.png",
          type: "image/png",
          sizes: "540x332",
          form_factor: "narrow",
        },
        {
          src: "pwa-screenshot5-vpsn.png",
          type: "image/png",
          sizes: "1024x630",
          form_factor: "wide",
        },
        {
          src: "pwa-screenshot3-vpsn.png",
          type: "image/png",
          sizes: "1024x714",
          form_factor: "wide",
        },
        {
          src: "pwa-screenshot4-vpsn.png",
          type: "image/png",
          sizes: "640x480",
          form_factor: "wide",
        },
      ],
      share_target: {
        action: "/?utm_medium=PWA&utm_source=share-target&share-target",
        method: "POST",
        enctype: "multipart/form-data",
        params: {
          files: [
            {
              name: "file",
              accept: ["image/*"],
            },
          ],
        },
      },
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      navigateFallback: "/",
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallbackAllowlist: [/^\/$/, /^\/budget-senegal(\/.*)?$/],
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: false,
      type: "module",
    },
  },
  compatibilityDate: "2024-09-08",
  // Used by the AI Chat to highlight code
  mdc: {
    headings: {
      anchorLinks: false,
    },
    highlight: {
      langs: [
        "ts",
        "js",
        "html",
        "css",
        "json",
        "md",
        "yaml",
        "bash",
        "css",
        "py",
        "tsx",
        "jsx",
        "go",
        "rust",
        "java",
        "kotlin",
        "swift",
        "csharp",
      ],
    },
  },
});
