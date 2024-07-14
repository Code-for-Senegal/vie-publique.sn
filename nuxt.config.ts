export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/content",
    "nuxt-gtag",
    "@nuxtjs/seo",
    "@nuxtjs/sitemap",
    "@nuxtjs/web-vitals",
    "@nuxt/image",
    "@vueuse/motion/nuxt",
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS,
    },
  },
  css: ["~/assets/css/app.css"],
  colorMode: {
    preference: "light",
  },
  content: {
    defaultLocale: "fr",
  },
  app: {
    head: {
      title: "Sénégal Rapports OFNAC Cours des compte IGE ARMP",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          name: "keywords",
          content:
            "vie-publique.sn, rapports Sénégal ARMP, Rapport IGE, IGF, Rapport OFNAC, Rapport Cours des Comptes, Cours des Comptes Sénégal",
        },
        {
          name: "description",
          content:
            "Rapports publics du Sénégal. ARMP, IGE, IGF, OFNAC, et Cours des Comptes pour encourager la transparence et la participation citoyenne.",
        },
        // Open Graph Meta Tags
        {
          property: "og:title",
          content:
            "vie-publique.sn - Rapports Sénégal OFNAC Cours des compte IGE ARMP",
        },
        {
          property: "og:description",
          content:
            "vie-publique.sn, rapports Sénégal ARMP, Rapport IGE, IGF, Rapport OFNAC, Rapport Cours des Comptes, Cours des Comptes Sénégal",
        },
        { property: "og:image", content: "/social-image.png" },
        { property: "og:url", content: "https://vie-publique.sn" },
        { property: "og:type", content: "website" },
        // Twitter Card Meta Tags
        {
          name: "twitter:title",
          content:
            "vie-publique.sn - Rapports Sénégal OFNAC Cours des compte IGE ARMP",
        },
        {
          name: "twitter:description",
          content: "Sénégal Rapports OFNAC, IGE, Cours des comptes, ARMP",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/social-image.png" },
      ],
    },
  },
  site: {
    defaultLocale: "fr",
  },
  gtag: {
    id: process.env.GTAG_ID,
  },
  webVitals: {
    ga: { id: process.env.GTAG_ID },
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },
  image: {
    // Options
  },
});
