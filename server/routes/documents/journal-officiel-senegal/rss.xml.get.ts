/**
 * /documents/journal-officiel-senegal/rss.xml — flux RSS du Journal officiel
 * (documents de type `official_journal`, même périmètre que la page
 * /documents/journal-officiel-senegal).
 * Items datés par `date_created` (ajout au site, backfill) — voir docs/modules/rss/flux-rss.md.
 */
export default defineCachedEventHandler(
  async (event) => {
    const siteUrl = getRssSiteUrl();

    const items = await fetchDocumentRssItems(siteUrl, {
      type: 'official_journal',
      limit: 30,
    }).catch((error) => {
      console.error('RSS journal officiel : échec de la source documents', error);
      throw createError({ statusCode: 503, statusMessage: 'Flux temporairement indisponible' });
    });

    setRssResponseHeaders(event);
    return buildRssFeed({
      title: 'Vie-Publique.sn — Journal officiel du Sénégal',
      link: `${siteUrl}/documents/journal-officiel-senegal`,
      selfUrl: `${siteUrl}/documents/journal-officiel-senegal/rss.xml`,
      description:
        'Dernières publications du Journal officiel de la République du Sénégal ajoutées sur Vie-Publique.sn.',
      items,
    });
  },
  {
    maxAge: getCacheMaxAge(30 * 60, 0), // prod : 30 min · dev : pas de cache
    name: 'rss-documents-jo',
  },
);
