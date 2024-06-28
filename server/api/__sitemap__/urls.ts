import reportsData from "@/assets/data/rapports-liste.json";

export default defineSitemapEventHandler(() => {
  // Générer un tableau de chaînes d'URL pour les rapports
  const reportUrls = reportsData.map((report) => `/reports/${report.slug}`);

  // Ajoute les autres URLs statiques manuellement
  const staticUrls = [{ loc: "/about/us" }, { loc: "/about/privacy" }];

  return [
    ...staticUrls,
    ...reportUrls,
    {
      // will end up in the pages sitemap
      _sitemap: "pages",
    },
  ];
});
