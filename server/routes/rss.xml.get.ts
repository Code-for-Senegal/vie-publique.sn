/**
 * /rss.xml — flux RSS global : 30 dernières publications du site, toutes rubriques
 * confondues (actualités + documents officiels + dossiers thématiques).
 * Voir docs/modules/rss/flux-rss.md.
 */
export default defineCachedEventHandler(
  async (event) => {
    const siteUrl = getRssSiteUrl();

    // Sources isolées : une source en échec est omise (dégradation propre),
    // mais si TOUT échoue on throw — Nitro ne met pas en cache les erreurs
    // (un flux vide en 200 serait resservi pendant 30 min).
    const results = await Promise.allSettled([
      fetchNewsRssItems(siteUrl, { limit: 15 }),
      fetchDocumentRssItems(siteUrl, { limit: 15 }),
      fetchDossierRssItems(siteUrl, { limit: 5 }),
    ]);
    const items = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    if (items.length === 0) {
      console.error(
        'RSS global : toutes les sources ont échoué',
        results.map((r) => (r.status === 'rejected' ? String(r.reason) : 'ok')),
      );
      throw createError({ statusCode: 503, statusMessage: 'Flux temporairement indisponible' });
    }

    setRssResponseHeaders(event);
    return buildRssFeed({
      title: 'Vie-Publique.sn — Dernières publications',
      link: siteUrl,
      selfUrl: `${siteUrl}/rss.xml`,
      description:
        'Dernières publications de Vie-Publique.sn : actualités, documents officiels (lois, décrets, Journal officiel, rapports) et dossiers sur la vie publique au Sénégal.',
      items: sortRssItemsDesc(items).slice(0, 30),
    });
  },
  {
    maxAge: getCacheMaxAge(30 * 60, 0), // prod : 30 min · dev : pas de cache
    name: 'rss-global',
  },
);
