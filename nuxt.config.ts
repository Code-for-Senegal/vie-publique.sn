import tailwindTypography from "@tailwindcss/typography";

export default defineNuxtConfig({
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
  ],
  devtools: { enabled: true },
  nitro: {
    plugins: ["~/server/plugins/redirects.ts"],
  },
  runtimeConfig: {
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
      ],
    },
  },
  css: ["~/assets/css/app.css"],
  colorMode: {
    preference: "light",
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
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
  site: {
    defaultLocale: "fr",
  },
  gtag: {
    enabled: !!process.env.GTAG_ID,
    id: process.env.GTAG_ID,
  },
  webVitals: {
    provider: "ga",
    disabled: !process.env.GTAG_ID,
    ga: { id: process.env.GTAG_ID },
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },
  image: {
    directus: {
      // This URL needs to include the final `assets/` directory
      baseURL: process.env.CMS_API_URL_ASSETS,
    },
  },
  pwa: {
    strategies: process.env.SW ? "injectManifest" : "generateSW",
    srcDir: process.env.SW ? "service-worker" : undefined,
    filename: process.env.SW ? "sw.ts" : undefined,
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
          src: "screenshot1-vpsn.png",
          type: "image/png",
          sizes: "321x321",
          form_factor: "narrow",
        },
        {
          src: "screenshot2-vpsn.png",
          type: "image/png",
          sizes: "540x332",
          form_factor: "narrow",
        },
        {
          src: "screenshot5-vpsn.png",
          type: "image/png",
          sizes: "1024x630",
          form_factor: "wide",
        },
        {
          src: "screenshot3-vpsn.png",
          type: "image/png",
          sizes: "1024x714",
          form_factor: "wide",
        },
        {
          src: "screenshot4-vpsn.png",
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
      version: Date.now().toString(),
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
});
