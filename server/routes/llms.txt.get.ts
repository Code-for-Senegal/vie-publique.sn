/**
 * /llms.txt — fichier d'orientation pour les crawlers IA (spec llmstxt.org).
 * Généré dynamiquement : statistiques du corpus et gouvernement actuel
 * tirés du CMS (via getLlmsStats, cache 1 h), date de mise à jour automatique.
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const siteUrl = (config.public.siteUrl || SITE_URL_CANONICAL).replace(/\/$/, '');

    const stats = await getLlmsStats();
    const now = new Date();

    const content = [
      buildLlmsHeader(stats, siteUrl, now),
      buildLlmsSections(siteUrl, stats),
      buildLlmsFooter(siteUrl, 'short'),
    ].join('\n\n');

    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    return content;
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 24 * 60 * 60 : 0, // 24 h en prod
    name: 'llms-txt',
  },
);
