import { readItems } from '@directus/sdk';
import { AUDIT_INSTITUTION_PAGES } from '~~/types/document';

/**
 * /llms-full.txt — version étendue de /llms.txt (spec llmstxt.org) :
 * mêmes sections + liens profonds vers les pages de référence stables
 * (dossiers thématiques, rapports par organisme, archives par année).
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const siteUrl = (config.public.siteUrl || SITE_URL_CANONICAL).replace(/\/$/, '');
    const directus = getCmsClient();

    const stats = await getLlmsStats();
    const now = new Date();

    // Dossiers thématiques : les pages de référence les plus citables du site
    let dossiersBlock = '';
    try {
      const dossiers = await directus.request(
        readItems('dossier', {
          fields: ['slug', 'title'],
          filter: { status: { _eq: 'published' } },
          sort: ['-publish_date'],
          limit: -1,
        }),
      );
      const links = (dossiers as { slug?: string | null; title?: string | null }[])
        .filter((d) => d.slug && d.title)
        .map((d) => `- [${d.title!.trim()}](${siteUrl}/dossiers/${d.slug})`);
      if (links.length) {
        dossiersBlock = `## Dossiers thématiques de référence\n\nSynthèses sourcées et maintenues à jour sur les grands sujets de la vie publique sénégalaise :\n\n${links.join('\n')}`;
      }
    } catch (error) {
      console.warn('llms-full.txt : échec de la lecture des dossiers', error);
    }

    // Rapports d'audit : une page dédiée par organisme de contrôle
    const auditBlock = `## Rapports d'audit par organisme de contrôle\n\n${AUDIT_INSTITUTION_PAGES.map(
      (orga) =>
        `- [${orga.fullName}](${siteUrl}/documents/rapports-audit/organisme/${orga.slug}) : ${orga.description}`,
    ).join('\n')}`;

    // Archives de documents par année (profondeur du corpus)
    let yearsBlock = '';
    try {
      const yearsData = await directus.request(
        readItems('documents', {
          fields: ['publish_date'],
          filter: { status: { _eq: 'published' }, publish_date: { _nnull: true } },
          groupBy: ['year(publish_date)'],
          aggregate: { countDistinct: 'id' },
          limit: -1,
        }),
      );
      const years = (yearsData as { publish_date_year?: number | string }[])
        .map((item) => item.publish_date_year)
        .filter((year) => Number.isFinite(Number(year)))
        .sort((a, b) => Number(b) - Number(a));
      if (years.length) {
        const links = years.map((year) => `[${year}](${siteUrl}/documents/annee/${year})`);
        yearsBlock = `## Archives de documents officiels par année\n\n${links.join(' · ')}\n\nCatégories archivées par année : [Journal officiel](${siteUrl}/documents/journal-officiel-senegal/annee), [rapports d'audit](${siteUrl}/documents/rapports-audit/annee), [codes juridiques](${siteUrl}/documents/codes/annee), [stratégies](${siteUrl}/documents/strategies/annee), [budget](${siteUrl}/documents/budget/annee).`;
      }
    } catch (error) {
      console.warn('llms-full.txt : échec de la lecture des années de documents', error);
    }

    const content = [
      buildLlmsHeader(stats, siteUrl, now),
      buildLlmsSections(siteUrl, stats),
      dossiersBlock,
      auditBlock,
      yearsBlock,
      buildLlmsFooter(siteUrl, 'full'),
    ]
      .filter(Boolean)
      .join('\n\n');

    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
    return content;
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 24 * 60 * 60 : 0, // 24 h en prod
    name: 'llms-full-txt-v3', // v3 : ajout des flux RSS
  },
);
