/**
 * /conseil-des-ministres/rss.xml — flux RSS des communiqués du Conseil des ministres
 * (collection `news`, catégorie « Conseil des ministres » — même source que la page).
 * Voir docs/rss/flux-rss.md.
 */
export default defineCachedEventHandler(
  async (event) => {
    const siteUrl = getRssSiteUrl();

    const items = await fetchNewsRssItems(siteUrl, {
      category: 'Conseil des ministres',
      limit: 20,
    }).catch((error) => {
      console.error('RSS conseil des ministres : échec de la source news', error);
      throw createError({ statusCode: 503, statusMessage: 'Flux temporairement indisponible' });
    });

    setRssResponseHeaders(event);
    return buildRssFeed({
      title: 'Vie-Publique.sn — Conseil des ministres',
      link: `${siteUrl}/conseil-des-ministres`,
      selfUrl: `${siteUrl}/conseil-des-ministres/rss.xml`,
      description:
        'Communiqués officiels du Conseil des ministres du Sénégal : décisions, nominations et décrets du gouvernement.',
      items,
    });
  },
  {
    maxAge: getCacheMaxAge(30 * 60, 0), // prod : 30 min · dev : pas de cache
    name: 'rss-conseil-ministres',
  },
);
