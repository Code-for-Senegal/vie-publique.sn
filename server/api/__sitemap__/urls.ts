import { serverQueryContent } from "#content/server";
import reportsData from "@/assets/data/rapports-liste.json";

export default defineSitemapEventHandler(async (event) => {
  // Générer un tableau de chaînes d'URL pour les rapports
  const reportUrls = reportsData.map(
    (report) => `/rapport-senegal/${report.slug}`
  );

  // Récupérer toutes les pages du dossier content
  const docs = await serverQueryContent(event).find();
  const contentUrls = docs.map((doc) => doc._path);

  return [
    ...reportUrls,
    ...contentUrls.map((url) => ({ loc: url })),
    {
      // will end up in the pages sitemap
      _sitemap: "pages",
    },
  ];
});
