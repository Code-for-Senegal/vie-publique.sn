import { readItems } from '@directus/sdk';
import type { Dossier } from '~~/types/dossier';

/**
 * GET /api/dossiers/:slug
 * Détail d'un dossier PUBLIÉ avec toutes ses relations résolues (M2M).
 *
 * - 404 si le slug n'existe pas OU si le dossier n'est pas publié
 *   (les brouillons ne sont jamais exposés publiquement).
 */
export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug');

    if (!slug) {
      throw createError({ statusCode: 400, statusMessage: 'Slug du dossier manquant' });
    }

    try {
      const directus = getCmsClient();

      const result = await directus.request(
        readItems('dossier', {
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' },
          },
          limit: 1,
          fields: [
            'id',
            'title',
            'slug',
            'type',
            'summary',
            'cover_image',
            'intro_html',
            'content_html',
            'publish_date',
            'date_created',
            'date_updated',
            'seo_title',
            'seo_description',
            'tags',
            'featured',
            'highlights',
            'faq',
            'timeline',
            'comparison',
            'sources',
            // Relations M2M — on ne récupère que les contenus publiés des cibles
            'documents.documents_id.id',
            'documents.documents_id.title',
            'documents.documents_id.slug',
            'documents.documents_id.type',
            'documents.documents_id.publish_date',
            'documents.documents_id.cover_image',
            'documents.documents_id.status',
            'news.news_id.id',
            'news.news_id.title',
            'news.news_id.slug',
            'news.news_id.date_published',
            'news.news_id.cover_image',
            'news.news_id.status',
            'news.news_id.category.name',
            // Cible réelle : collection `vp_podcasts` → FK `vp_podcasts_id`
            'podcasts.vp_podcasts_id.id',
            'podcasts.vp_podcasts_id.title',
            'podcasts.vp_podcasts_id.slug',
            'podcasts.vp_podcasts_id.youtube_video_id',
            'podcasts.vp_podcasts_id.cover_image',
            'public_persons.public_persons_id.id',
            'public_persons.public_persons_id.full_name',
            'public_persons.public_persons_id.slug',
            'public_persons.public_persons_id.photo',
            'public_persons.public_persons_id.status',
            'public_entities.state_organization_entity_id.id',
            'public_entities.state_organization_entity_id.name',
            'public_entities.state_organization_entity_id.slug',
            'public_entities.state_organization_entity_id.logo',
            'public_entities.state_organization_entity_id.has_public_page',
            'public_entities.state_organization_entity_id.entity_type.code',
          ],
        }),
      );

      const raw = (result as any[])?.[0];

      if (!raw) {
        throw createError({ statusCode: 404, statusMessage: 'Dossier non trouvé' });
      }

      // Helper : aplatit une relation M2M Directus `[{ <fk>: {...} }]` en `[{...}]`
      // en filtrant les cibles nulles (contenu supprimé) ou non publiées.
      const flattenM2M = <T>(
        rows: any[] | undefined,
        fk: string,
        opts: { requirePublished?: boolean } = {},
      ): T[] => {
        if (!Array.isArray(rows)) return [];
        return rows
          .map((row) => row?.[fk])
          .filter((item) => {
            if (!item) return false;
            if (opts.requirePublished && item.status && item.status !== 'published') return false;
            return true;
          }) as T[];
      };

      const dossier: Dossier = {
        id: raw.id,
        title: raw.title?.trim() || raw.title,
        slug: raw.slug,
        ...(raw.type ? { type: raw.type } : {}),
        ...(raw.summary ? { summary: raw.summary } : {}),
        ...(raw.cover_image ? { cover_image: raw.cover_image } : {}),
        ...(raw.intro_html ? { intro_html: raw.intro_html } : {}),
        ...(raw.content_html ? { content_html: raw.content_html } : {}),
        ...(raw.publish_date ? { publish_date: raw.publish_date } : {}),
        ...(raw.date_created ? { date_created: raw.date_created } : {}),
        ...(raw.date_updated ? { date_updated: raw.date_updated } : {}),
        ...(raw.seo_title ? { seo_title: raw.seo_title } : {}),
        ...(raw.seo_description ? { seo_description: raw.seo_description } : {}),
        ...(Array.isArray(raw.tags) ? { tags: raw.tags } : {}),
        ...(raw.featured ? { featured: true } : {}),

        // Blocs éditoriaux (JSON repeaters)
        highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
        faq: Array.isArray(raw.faq) ? raw.faq : [],
        timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
        comparison: Array.isArray(raw.comparison) ? raw.comparison : [],
        sources: Array.isArray(raw.sources) ? raw.sources : [],

        // Relations résolues
        documents: flattenM2M(raw.documents, 'documents_id', { requirePublished: true }).map(
          (d: any) => ({
            id: d.id,
            title: d.title,
            slug: d.slug,
            type: d.type,
            publish_date: d.publish_date,
            cover_image: d.cover_image,
          }),
        ),
        news: flattenM2M(raw.news, 'news_id', { requirePublished: true }).map((n: any) => ({
          id: n.id,
          title: n.title,
          slug: n.slug,
          date_published: n.date_published,
          cover_image: n.cover_image,
          category: n.category?.name,
        })),
        podcasts: flattenM2M(raw.podcasts, 'vp_podcasts_id').map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          youtube_video_id: p.youtube_video_id,
          cover_image: p.cover_image,
        })),
        public_persons: flattenM2M(raw.public_persons, 'public_persons_id', {
          requirePublished: true,
        }).map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          slug: p.slug,
          photo: p.photo,
        })),
        public_entities: flattenM2M(raw.public_entities, 'state_organization_entity_id')
          .filter((i: any) => i.has_public_page && i.slug)
          .map((i: any) => ({
            id: i.id,
            name: i.name,
            slug: i.slug,
            logo: i.logo,
            type_code: i.entity_type?.code,
          })),
      };

      return { dossier };
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error(`Erreur lors de la récupération du dossier ${slug}:`, error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération du dossier',
      });
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT, 0), // prod : 5 min · dev : pas de cache
    name: 'dossier-detail',
    getKey: (event) => `dossier-detail-${getRouterParam(event, 'slug')}`,
  },
);
