import type { H3Event } from 'h3';
import { readItems } from '@directus/sdk';
import { cleanCmsText, truncateText } from '#shared/clean-text';
import { DOCUMENT_TYPE_LABELS } from '#shared/document-type-labels.mjs';

/**
 * Flux RSS 2.0 — builder + fetchers partagés par les routes `server/routes/**⁠/rss.xml.get.ts`.
 *
 * Documentation complète (choix de design, ajout d'un nouveau flux, vérification) :
 * docs/modules/rss/flux-rss.md. Points clés :
 * - Les items « documents » sont datés/triés par `date_created` (date d'AJOUT au site),
 *   PAS `publish_date` (date officielle du texte) : le site fait du backfill (un JO de
 *   2019 importé aujourd'hui doit apparaître comme nouveau dans le flux).
 * - Les actualités sont datées par `date_published`, les dossiers par `publish_date`.
 * - Descriptions nettoyées via cleanCmsText (strip HTML + entités + NFKC) puis tronquées
 *   au code point — même exigence que les meta SEO (cf. CLAUDE.md §11 SEO).
 * - XML fait main (zéro dépendance, cohérent avec llms.txt) : tout texte passe par
 *   escapeXml, JAMAIS d'interpolation brute.
 */

export interface RssItem {
  title: string;
  /** URL absolue de la page détail — sert aussi de <guid isPermaLink="true"> */
  link: string;
  /** Date brute (ISO Directus) — convertie en RFC 1123 au rendu, item ignoré si invalide */
  pubDate: string;
  description?: string;
  category?: string;
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toRfc1123 = (raw: string): string | null => {
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date.toUTCString();
};

/** Tri anté-chronologique (les dates invalides passent en fin de flux). */
export const sortRssItemsDesc = (items: RssItem[]): RssItem[] =>
  [...items].sort((a, b) => {
    const ta = new Date(a.pubDate).getTime() || 0;
    const tb = new Date(b.pubDate).getTime() || 0;
    return tb - ta;
  });

export const buildRssFeed = (channel: {
  title: string;
  /** URL absolue de la rubrique HTML correspondante */
  link: string;
  /** URL absolue du flux lui-même (atom:link rel="self", requis par le validateur W3C) */
  selfUrl: string;
  description: string;
  items: RssItem[];
}): string => {
  const items = sortRssItemsDesc(channel.items);
  // lastBuildDate déterministe (date du dernier item, pas `new Date()`) :
  // le XML ne change que si le contenu change → cache et diff propres.
  const lastBuild = items.length > 0 ? toRfc1123(items[0]!.pubDate) : null;

  const itemsXml = items
    .map((item) => {
      const pubDate = toRfc1123(item.pubDate);
      const lines = [
        '    <item>',
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
        ...(pubDate ? [`      <pubDate>${pubDate}</pubDate>`] : []),
        ...(item.category ? [`      <category>${escapeXml(item.category)}</category>`] : []),
        ...(item.description
          ? [`      <description>${escapeXml(item.description)}</description>`]
          : []),
        '    </item>',
      ];
      return lines.join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml"/>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    '    <language>fr</language>',
    ...(lastBuild ? [`    <lastBuildDate>${lastBuild}</lastBuildDate>`] : []),
    itemsXml,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
};

/** URL du site sans slash final (même résolution que les routes llms.txt). */
export const getRssSiteUrl = (): string => {
  const config = useRuntimeConfig();
  return ((config.public.siteUrl as string) || SITE_URL_CANONICAL).replace(/\/$/, '');
};

const cleanDescription = (html?: string | null, max = 300): string =>
  truncateText(cleanCmsText(html), max);

/** Même logique de slug de secours que getArticleUrl (app/pages/actualites/index.vue). */
const fallbackSlug = (title?: string | null): string =>
  title
    ? title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : 'actualite';

interface RssNewsRow {
  id: number;
  title?: string | null;
  slug?: string | null;
  date_published?: string | null;
  content?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
}

interface RssDocumentRow {
  id: number;
  title?: string | null;
  slug?: string | null;
  type?: string | null;
  publish_date?: string | null;
  date_created?: string | null;
  description?: string | null;
}

interface RssDossierRow {
  id: number;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  publish_date?: string | null;
}

/**
 * URL détail d'une actualité selon sa catégorie — répliqué de getArticleUrl
 * (app/pages/actualites/index.vue) : les communiqués du Conseil des ministres et
 * les actualités de l'Assemblée ont leur propre rubrique.
 */
const newsArticleUrl = (siteUrl: string, article: RssNewsRow): string => {
  const slug = article.slug || fallbackSlug(article.title);
  const categorySlug = article.category?.slug;
  if (categorySlug === 'conseil-des-ministres') {
    return `${siteUrl}/conseil-des-ministres/${article.id}/${slug}`;
  }
  if (categorySlug === 'assemblee-nationale') {
    return `${siteUrl}/assemblee-nationale/actualites/${article.id}/${slug}`;
  }
  return `${siteUrl}/actualites/${article.id}/${slug}`;
};

/** Actualités (collection `news`), option filtre par nom de catégorie. */
export const fetchNewsRssItems = async (
  siteUrl: string,
  options: { category?: string; limit?: number } = {},
): Promise<RssItem[]> => {
  const directus = getCmsClient();
  const filter: Record<string, unknown> = { status: { _eq: 'published' } };
  if (options.category) {
    filter.category = { name: { _eq: options.category } };
  }
  const articles = await directus.request(
    readItems('news', {
      fields: [
        'id',
        'title',
        'slug',
        'date_published',
        'content',
        'category.name',
        'category.slug',
      ],
      filter,
      sort: ['-date_published'],
      limit: options.limit ?? 30,
    }),
  );
  return (articles as RssNewsRow[])
    .filter((a) => a.title && a.date_published)
    .map((a) => ({
      title: cleanCmsText(a.title),
      link: newsArticleUrl(siteUrl, a),
      pubDate: a.date_published || '',
      description: cleanDescription(a.content),
      ...(a.category?.name ? { category: a.category.name } : {}),
    }));
};

/** Documents officiels (collection `documents`), option filtre par `type` Directus. */
export const fetchDocumentRssItems = async (
  siteUrl: string,
  options: { type?: string; limit?: number } = {},
): Promise<RssItem[]> => {
  const directus = getCmsClient();
  const filter: Record<string, unknown> = { status: { _eq: 'published' } };
  if (options.type) {
    filter.type = { _eq: options.type };
  }
  const documents = await directus.request(
    readItems('documents', {
      fields: ['id', 'title', 'slug', 'type', 'publish_date', 'date_created', 'description'],
      filter,
      // date_created = date d'ajout au site (voir en-tête de fichier : backfill)
      sort: ['-date_created'],
      limit: options.limit ?? 30,
    }),
  );
  return (documents as RssDocumentRow[])
    .filter((d) => d.title && d.date_created)
    .map((d) => {
      const label = DOCUMENT_TYPE_LABELS[d.type as keyof typeof DOCUMENT_TYPE_LABELS];
      return {
        title: cleanCmsText(d.title),
        link: `${siteUrl}/documents/${d.id}/${d.slug || fallbackSlug(d.title)}`,
        pubDate: d.date_created || '',
        description:
          cleanDescription(d.description) ||
          (label ? `${label} — document officiel publié sur Vie-Publique.sn` : ''),
        ...(label ? { category: label } : {}),
      };
    });
};

/** Dossiers thématiques (collection `dossier` — SINGULIER). */
export const fetchDossierRssItems = async (
  siteUrl: string,
  options: { limit?: number } = {},
): Promise<RssItem[]> => {
  const directus = getCmsClient();
  const dossiers = await directus.request(
    readItems('dossier', {
      fields: ['id', 'title', 'slug', 'summary', 'publish_date'],
      filter: { status: { _eq: 'published' } },
      sort: ['-publish_date'],
      limit: options.limit ?? 5,
    }),
  );
  return (dossiers as RssDossierRow[])
    .filter((d) => d.title && d.slug && d.publish_date)
    .map((d) => ({
      title: cleanCmsText(d.title),
      link: `${siteUrl}/dossiers/${d.slug}`,
      pubDate: d.publish_date || '',
      description: cleanDescription(d.summary),
      category: 'Dossier',
    }));
};

/** En-têtes de réponse communs aux 5 routes rss.xml. */
export const setRssResponseHeaders = (event: H3Event): void => {
  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
  // Crawlable (autodiscovery) mais pas dans les résultats de recherche Google
  setResponseHeader(event, 'X-Robots-Tag', 'noindex');
};
