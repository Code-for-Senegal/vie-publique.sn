// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/content", "nuxt-gtag", "@nuxtjs/seo"],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      showPinnedPeoples: process.env.PUBLIC_SHOW_PINNED_PEOLPLES,
      showScandals: process.env.PUBLIC_SHOW_SCANDALS
    }
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
      title: "Vie Publique Sénégal",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  site: {
    name: "Vie Publique Sénégal",
    description: "Au coeur du débat public",
    defaultLocale: "fr",
  },
  robots: {
    allow: ["/", "/reports/*", "/about/us", "/about/privacy"],
    disallow: [
      "/financial-scandals",
      "/individuals-cited",
      "/nominations",
      "/siteweb",
      "/about/faq",
      "/about/cgu",
      "/about/contact",
      "/about/test",
    ],
  },
  sitemap: {
    exclude: [
      "/individuals-cited/**",
      "/financial-scandals/**",
      "/nominations",
      "/siteweb/**",
      "/about/faq",
      "/about/cgu",
      "/about/contact",
      "/about/test",
    ],
    include: ["/", "/reports/**", "/about/us", "/about/privacy"],
  },
  gtag: {
    id: process.env.GTAG_ID,
  },
});
