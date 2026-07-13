/**
 * /documents/rss.xml — flux RSS des documents officiels (tous types : lois, décrets,
 * Journal officiel, rapports, communiqués…).
 * Items datés par `date_created` (ajout au site) et non `publish_date` (date officielle
 * du texte) à cause du backfill — voir docs/rss/flux-rss.md.
 */
export default defineCachedEventHandler(
  async (event) => {
    const siteUrl = getRssSiteUrl();

    const items = await fetchDocumentRssItems(siteUrl, { limit: 30 }).catch((error) => {
      console.error('RSS documents : échec de la source documents', error);
      throw createError({ statusCode: 503, statusMessage: 'Flux temporairement indisponible' });
    });

    setRssResponseHeaders(event);
    return buildRssFeed({
      title: 'Vie-Publique.sn — Documents officiels',
      link: `${siteUrl}/documents`,
      selfUrl: `${siteUrl}/documents/rss.xml`,
      description:
        'Derniers documents officiels du Sénégal publiés sur Vie-Publique.sn : lois, décrets, Journal officiel, rapports publics, communiqués.',
      items,
    });
  },
  {
    maxAge: getCacheMaxAge(30 * 60, 0), // prod : 30 min · dev : pas de cache
    name: 'rss-documents',
  },
);
