// server/api/documents/related/[id].get.ts
// Documents similaires (maillage interne — Phase 5 de docs/seo/seo-strategy.md).
// Similarité par métadonnées partagées, par ordre de priorité :
// même audit_institution > même type > même family. Dédupliqué, document courant exclu.
import { readItem, readItems } from '@directus/sdk';
import type { Document } from '~~/types/document';

const MAX_RELATED = 6;

// Ligne Directus telle que remontée par LIST_FIELDS
type RelatedRow = Pick<
  Document,
  | 'id'
  | 'title'
  | 'slug'
  | 'type'
  | 'publish_date'
  | 'audit_institution'
  | 'family'
  | 'cover_image'
  | 'file'
>;

// Champs alignés sur la liste documents (affichage via DocumentListItem)
const LIST_FIELDS = [
  'id',
  'title',
  'slug',
  'type',
  'publish_date',
  'audit_institution',
  'family',
  'cover_image',
  'file.id',
  'file.type',
  'file.filesize',
  'file.filename_download',
] as const;

export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID du document manquant',
      });
    }

    // Widget de recommandation : toute défaillance CMS dégrade en liste vide,
    // jamais en 500 (la page document ne doit pas dépendre de cette section).
    try {
      const directus = getCmsClient();

      const current = await directus.request(
        readItem('documents', id, {
          fields: ['id', 'status', 'type', 'family', 'audit_institution'],
        }),
      );

      if (!current || current.status !== 'published') {
        return { documents: [] };
      }

      const baseFilter = {
        status: { _eq: 'published' },
        id: { _neq: current.id },
      };

      const fetchByCriterion = (criterion: Record<string, unknown>): Promise<RelatedRow[]> =>
        directus
          .request(
            readItems('documents', {
              fields: [...LIST_FIELDS],
              filter: { ...baseFilter, ...criterion },
              sort: ['-publish_date', 'id'],
              limit: MAX_RELATED,
            }),
          )
          .then((rows) => rows as RelatedRow[])
          .catch(() => []); // requête isolée : échec = critère omis

      const none: RelatedRow[] = [];

      // Priorité : institution d'audit (le plus discriminant) > type > famille
      const [byInstitution, byType, byFamily] = await Promise.all([
        current.audit_institution
          ? fetchByCriterion({ audit_institution: { _eq: current.audit_institution } })
          : Promise.resolve(none),
        current.type ? fetchByCriterion({ type: { _eq: current.type } }) : Promise.resolve(none),
        current.family
          ? fetchByCriterion({ family: { _eq: current.family } })
          : Promise.resolve(none),
      ]);

      const seen = new Set<number>();
      const documents: Document[] = [];
      for (const doc of [...byInstitution, ...byType, ...byFamily]) {
        if (seen.has(Number(doc.id))) continue;
        seen.add(Number(doc.id));
        documents.push({
          id: doc.id,
          title: doc.title?.trim() || doc.title,
          slug: doc.slug,
          type: doc.type,
          publish_date: doc.publish_date,
          ...(doc.audit_institution ? { audit_institution: doc.audit_institution } : {}),
          ...(doc.family ? { family: doc.family } : {}),
          ...(doc.cover_image ? { cover_image: doc.cover_image } : {}),
          ...(doc.file ? { file: doc.file } : {}),
        });
        if (documents.length >= MAX_RELATED) break;
      }

      return { documents };
    } catch (error) {
      console.error(`Erreur documents similaires pour ${id}:`, error);
      return { documents: [] };
    }
  },
  {
    maxAge: 60 * 60, // 1 heure — ne change qu'à l'ajout de nouveaux documents
    name: 'documents-related',
    getKey: (event) => `documents-related-${getRouterParam(event, 'id')}`,
  },
);
