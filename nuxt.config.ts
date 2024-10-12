import tailwindTypography from "@tailwindcss/typography";

export default defineNuxtConfig({
  ssr: true,
  modules: [
    "@nuxt/ui",
    "@nuxt/content",
    "nuxt-gtag",
    "@nuxtjs/seo",
    "@nuxtjs/sitemap",
    "@nuxtjs/web-vitals",
    "@nuxt/image",
    "@vueuse/motion/nuxt",
    "@nuxt/eslint",
    "@pinia/nuxt",
  ],
  devtools: { enabled: true },
  nitro: {
    plugins: ["~/server/plugins/redirects.ts"],
  },
  runtimeConfig: {
    public: {
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showBarometer: process.env.PUBLIC_SHOW_BAROMETER,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS,
      brevoApiKey: process.env.BREVO_API_KEY,
      brevoListId: process.env.BREVO_LIST_ID,
      googleAdsId: process.env.GOOGLE_ADS_ID,
      cmsApiUrl: process.env.CMS_API_URL,
      cmsApiKey: process.env.CMS_API_KEY,
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
  site: {
    defaultLocale: "fr",
  },
  gtag: {
    enabled: !!process.env.GTAG_ID,
    id: process.env.GTAG_ID,
    config: {
      send_page_view: true,
      anonymize_ip: true,
      conversion_linker: true,
    },
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
    // Options
  },
  compatibilityDate: "2024-09-08",
});
