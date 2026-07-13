/**
 * /actualites/rss.xml — flux RSS des actualités (toutes catégories : générales,
 * Conseil des ministres, Assemblée nationale…) + derniers dossiers thématiques.
 * Voir docs/rss/flux-rss.md.
 */
export default defineCachedEventHandler(
  async (event) => {
    const siteUrl = getRssSiteUrl();

    // Les actualités sont la source principale : leur échec fait échouer le flux
    // (pas de cache d'un flux partiel). Les dossiers, source d'appoint, dégradent.
    const news = await fetchNewsRssItems(siteUrl, { limit: 30 }).catch((error) => {
      console.error('RSS actualités : échec de la source news', error);
      throw createError({ statusCode: 503, statusMessage: 'Flux temporairement indisponible' });
    });
    const dossiers = await fetchDossierRssItems(siteUrl, { limit: 5 }).catch(() => []);

    setRssResponseHeaders(event);
    return buildRssFeed({
      title: 'Vie-Publique.sn — Actualités',
      link: `${siteUrl}/actualites`,
      selfUrl: `${siteUrl}/actualites/rss.xml`,
      description:
        'Actualités de la vie publique au Sénégal : gouvernement, Assemblée nationale, Conseil des ministres, institutions, et dossiers thématiques.',
      items: sortRssItemsDesc([...news, ...dossiers]).slice(0, 30),
    });
  },
  {
    maxAge: getCacheMaxAge(30 * 60, 0), // prod : 30 min · dev : pas de cache
    name: 'rss-actualites',
  },
);
