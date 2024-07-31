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
  ],
  devtools: { enabled: true },
  nitro: {
    plugins: ["~/server/plugins/redirects.ts"],
  },
  runtimeConfig: {
    public: {
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS,
      brevoApiKey: process.env.BREVO_API_KEY,
      brevoListId: process.env.BREVO_LIST_ID,
      redirects: [
        { from: "^/reports(.*)", to: "/rapport-senegal$1" },
        // Ajoutez d'autres redirections ici
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
  },
  app: {
    head: {
      title: "Sénégal | Vie-Publique.sn",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          name: "keywords",
          content:
            "Sénégal gouvernement journal officiel rapports OFNAC Cours des Comptes IGE ARMP CENTIF",
        },
        {
          name: "description",
          content:
            "Gouvernement du Sénégal, journal officiel, rapports d'audit OFNAC Cours des Comptes",
        },
        // Open Graph Meta Tags
        {
          property: "og:title",
          content: "Sénégal | Vie-Publique.sn",
        },
        {
          property: "og:description",
          content:
            "Gouvernement du Sénégal, journal officiel, rapports d'audit OFNAC Cours des Comptes",
        },
        { property: "og:image", content: "/social-image.png" },
        { property: "og:url", content: "https://vie-publique.sn" },
        { property: "og:type", content: "website" },
        // Twitter Card Meta Tags
        {
          name: "twitter:title",
          content: "Sénégal | Vie-Publique.sn",
        },
        {
          name: "twitter:description",
          content:
            "Gouvernement du Sénégal, journal officiel, rapports d'audit OFNAC Cours des Comptes",
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
    enabled: !process.env.GTAG_ID,
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
    // Options
  },
});
