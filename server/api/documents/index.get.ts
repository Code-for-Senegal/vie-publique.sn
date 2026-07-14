import { readItems } from '@directus/sdk';
import type { Document } from '~~/types/document';
// Source de vérité partagée avec scripts/search-reindex.mjs (alias Nuxt 4 du dossier shared/)
import { DOCUMENT_TYPE_LABELS } from '#shared/document-type-labels.mjs';

/**
 * C10 — Recherche de la liste documents via Typesense (pertinence, accents, synonymes)
 * au lieu du `_icontains` Postgres sur content_html (LIKE %…% non indexable).
 * Retourne les IDs Directus classés par pertinence + le total, ou `null` si la
 * combinaison de filtres n'est pas couverte par l'index (→ fallback Directus).
 */
async function searchDocumentIdsViaTypesense(opts: {
  search: string;
  effType: string | null; // type Directus brut (official_journal…), déjà validé
  effYear: number | null;
  sortBy: string;
  page: number;
  limit: number;
}): Promise<{ ids: number[]; total: number } | null> {
  const filterClauses = ['type:=document'];
  if (opts.effType) {
    const label = DOCUMENT_TYPE_LABELS[opts.effType as keyof typeof DOCUMENT_TYPE_LABELS];
    if (!label) return null; // type inconnu du mapping → fallback Directus
    filterClauses.push(`category:=\`${label}\``);
  }
  if (opts.effYear) {
    const start = Date.UTC(opts.effYear, 0, 1) / 1000;
    const end = Date.UTC(opts.effYear + 1, 0, 1) / 1000;
    filterClauses.push(`date_published:>=${start} && date_published:<${end}`);
  }

  // Tri : par défaut (-publish_date) → pertinence d'abord ; tri date croissante explicite
  // respecté ; tri par titre non supporté par l'index (champ non triable) → fallback.
  let sortByTs = '_text_match:desc,date_published:desc';
  if (opts.sortBy.includes('title')) return null;
  if (opts.sortBy.trim() === 'publish_date') sortByTs = 'date_published:asc';

  try {
    // Scoring commun (query_by, text_match_type, prioritize_*) : TYPESENSE_QUERY_DEFAULTS
    // via searchTypesense (server/utils/typesense.ts) — partagé avec /api/search
    const response: any = await searchTypesense({
      q: opts.search,
      query_by_weights: '80,45,30,5',
      sort_by: sortByTs,
      filter_by: filterClauses.join(' && '),
      include_fields: 'source_id,id',
      highlight_fields: 'none',
      per_page: Math.min(opts.limit, 100),
      page: opts.page,
    });
    const ids = (response.hits || [])
      .map((hit: any) => {
        const doc = hit.document || {};
        const raw = doc.source_id || String(doc.id || '').replace(/^document-/, '');
        return parseInt(raw);
      })
      .filter((id: number) => !isNaN(id));
    return { ids, total: response.found || 0 };
  } catch (error) {
    // Dégradation propre : Typesense indisponible → le fallback Directus prend le relais
    console.error('Recherche documents via Typesense échouée, fallback Directus:', error);
    return null;
  }
}

export default defineCachedEventHandler(
  async (event) => {
    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || (query.sort as string) || '-publish_date';
    const filterType = query.filterType as string;
    const type = query.type as string;
    const electionIds = query.election_ids as string; // IDs séparés par des virgules
    const year = query.year as string;
    const auditInstitution = query.audit_institution as string;
    const family = query.family as string;

    try {
      const directus = getCmsClient();

      // ─── C10 : recherche textuelle via Typesense ───────────────────────────────
      // Pertinence + accents + synonymes (index vp-search) au lieu du LIKE Postgres.
      // Filtres non indexés (famille, institution d'audit, élections) → fallback Directus.
      if (search && search.trim() !== '') {
        // Résolution type/année effective (même logique de précédence que le filtre legacy)
        let effType: string | null = type && type !== 'all' ? type : null;
        let effYear: number | null = null;
        let unsupported =
          Boolean(auditInstitution && auditInstitution !== 'all') ||
          Boolean(family && family !== 'all') ||
          Boolean(electionIds);
        if (filterType && filterType !== '' && filterType !== 'all') {
          const ftYear = parseInt(filterType);
          if (!isNaN(ftYear)) {
            effYear = ftYear;
          } else if (type === 'audit_report') {
            unsupported = true; // filterType = institution d'audit, non indexée
          } else {
            effType = filterType;
          }
        }
        if (year && year !== 'all') {
          const yearNum = parseInt(year);
          if (!isNaN(yearNum)) effYear = yearNum;
        }

        if (!unsupported) {
          const tsResult = await searchDocumentIdsViaTypesense({
            search,
            effType,
            effYear,
            sortBy,
            page,
            limit,
          });
          if (tsResult) {
            if (tsResult.ids.length === 0) {
              return {
                documents: [],
                totalDocuments: 0,
                pagination: { page, limit, total: 0, totalPages: 0 },
              };
            }
            // Hydratation Directus (mêmes champs que la liste) puis remise dans
            // l'ordre de pertinence Typesense
            const hydrated = await directus.request(
              readItems('documents', {
                fields: [
                  'id',
                  'title',
                  'slug',
                  'type',
                  'publish_date',
                  'date_created',
                  'description',
                  'audit_institution',
                  'family',
                  'cover_image',
                  'file.id',
                  'file.type',
                  'file.filesize',
                  'file.filename_download',
                ],
                filter: { id: { _in: tsResult.ids }, status: { _eq: 'published' } },
                limit: tsResult.ids.length,
              }),
            );
            const byId = new Map(hydrated.map((doc: any) => [Number(doc.id), doc]));
            const ordered = tsResult.ids.map((id) => byId.get(id)).filter(Boolean) as any[];

            const documents: Document[] = ordered.map((doc) => ({
              id: doc.id,
              title: doc.title?.trim() || doc.title,
              slug: doc.slug,
              type: doc.type,
              publish_date: doc.publish_date,
              ...(doc.date_created ? { date_created: doc.date_created } : {}),
              ...(doc.description ? { description: doc.description } : {}),
              ...(doc.audit_institution ? { audit_institution: doc.audit_institution } : {}),
              ...(doc.family ? { family: doc.family } : {}),
              ...(doc.cover_image ? { cover_image: doc.cover_image } : {}),
              ...(doc.file ? { file: doc.file } : {}),
            }));

            return {
              documents,
              totalDocuments: tsResult.total,
              pagination: {
                page,
                limit,
                total: tsResult.total,
                totalPages: Math.ceil(tsResult.total / limit),
              },
            };
          }
        }
      }
      // ───────────────────────────────────────────────────────────────────────────

      // Si on filtre par election_id(s), récupérer d'abord les élections avec leurs documents
      let documentIdsFromElections: number[] = [];
      const electionIdsList: number[] = [];

      // Construire la liste des IDs d'élections à filtrer
      if (electionIds) {
        electionIdsList.push(
          ...electionIds
            .split(',')
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id)),
        );
      }

      if (electionIdsList.length > 0) {
        try {
          const electionData = await directus.request(
            readItems('elections', {
              fields: ['documents.documents_id.id'],
              filter: {
                id: { _in: electionIdsList },
              },
              limit: electionIdsList.length,
            }),
          );

          if (electionData && electionData.length > 0) {
            for (const election of electionData as any[]) {
              if (election.documents && Array.isArray(election.documents)) {
                const docIds = election.documents
                  .map((doc: any) => doc?.documents_id?.id)
                  .filter((id: any) => id !== null && id !== undefined);
                documentIdsFromElections.push(...docIds);
              }
            }
            // Dédupliquer les IDs de documents
            documentIdsFromElections = [...new Set(documentIdsFromElections)];
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des élections:', err);
        }
      }

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: 'published',
        },
      };

      // Filtre par type (prioritaire)
      if (type && type !== 'all') {
        filter.type = {
          _eq: type,
        };
      }

      // Filtre par election_id(s) - utiliser les IDs récupérés
      if (electionIdsList.length > 0 && documentIdsFromElections.length > 0) {
        filter.id = {
          _in: documentIdsFromElections,
        };
      } else if (electionIdsList.length > 0 && documentIdsFromElections.length === 0) {
        // Si les élections n'ont pas de documents, retourner un résultat vide
        return {
          documents: [],
          totalDocuments: 0,
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      // Filtre par année
      if (filterType && filterType !== '' && filterType !== 'all') {
        const year = parseInt(filterType);
        if (!isNaN(year)) {
          filter.publish_date = {
            _between: [`${year}-01-01`, `${year}-12-31`],
          };
        } else {
          // Si ce n'est pas une année, c'est un type OU un audit_institution
          // Pour les rapports d'audit, on filtre par audit_institution
          if (type === 'audit_report') {
            filter.audit_institution = {
              _eq: filterType,
            };
          } else {
            // Pour les autres types, on filtre par type
            filter.type = {
              _eq: filterType,
            };
          }
        }
      }

      // Filtre par année (paramètre dédié, prioritaire sur filterType)
      if (year && year !== 'all') {
        const yearNum = parseInt(year);
        if (!isNaN(yearNum)) {
          filter.publish_date = {
            _between: [`${yearNum}-01-01`, `${yearNum}-12-31`],
          };
        }
      }

      // Filtre par organisme d'audit (paramètre dédié)
      if (auditInstitution && auditInstitution !== 'all') {
        filter.audit_institution = {
          _eq: auditInstitution,
        };
      }

      // Filtre par famille de documents
      if (family && family !== 'all') {
        filter.family = {
          _eq: family,
        };
      }

      // Recherche textuelle — fallback Directus quand Typesense ne couvre pas la
      // combinaison de filtres (famille, institution d'audit, élections, tri titre).
      // ⚠️ content_html volontairement exclu : LIKE %…% non indexable sur ~10 000 docs
      // (la recherche plein-texte est assurée par Typesense ci-dessus).
      if (search) {
        filter._or = [
          {
            title: {
              _icontains: search,
            },
          },
          {
            description: {
              _icontains: search,
            },
          },
          {
            audit_institution: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Gérer le tri - Directus SDK accepte les formats: 'field' ou '-field'
      // On ajoute un tri secondaire pour la stabilité des résultats
      const sortFields: string[] = [];

      if (sortBy) {
        // Nettoyage du paramètre au cas où
        const cleanSort = sortBy.toString().trim();
        if (cleanSort) {
          sortFields.push(cleanSort);

          // Tris secondaires pour la stabilité
          if (cleanSort.includes('title')) {
            sortFields.push('-publish_date');
          } else if (cleanSort.includes('publish_date')) {
            sortFields.push('title');
          }
        }
      }

      if (sortFields.length === 0) {
        sortFields.push('-publish_date');
      }

      // Toujours ajouter l'ID en dernier ressort pour une stabilité totale
      sortFields.push('id');

      // Récupération des documents avec pagination et meta
      const documentData = await directus
        .request(
          readItems('documents', {
            fields: [
              'id',
              'title',
              'slug',
              'type',
              'publish_date',
              'date_created',
              'description',
              'audit_institution',
              'family',
              'cover_image',
              'file.id',
              'file.type',
              'file.filesize',
              'file.filename_download',
            ],
            filter,
            limit,
            offset,
            sort: sortFields,
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || 'Erreur interne du serveur',
          });
        });

      // Recuperation du total de documents
      const totalCount = await directus
        .request(
          readItems('documents', {
            fields: ['id'],
            filter,
            aggregate: {
              count: ['id'],
            },
          }),
        )
        .then((result: any) => {
          return result?.[0]?.count?.id || 0;
        })
        .catch(() => documentData.length);

      // Transformation des données
      const transformedDocuments: Document[] = documentData.map((doc) => ({
        id: doc.id,
        title: doc.title?.trim() || doc.title,
        slug: doc.slug,
        type: doc.type,
        publish_date: doc.publish_date,
        ...(doc.date_created ? { date_created: doc.date_created } : {}),
        ...(doc.description ? { description: doc.description } : {}),
        ...(doc.audit_institution ? { audit_institution: doc.audit_institution } : {}),
        ...(doc.family ? { family: doc.family } : {}),
        ...(doc.cover_image ? { cover_image: doc.cover_image } : {}),
        ...(doc.file ? { file: doc.file } : {}),
      }));

      return {
        documents: transformedDocuments,
        totalDocuments: Number(totalCount),
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / limit),
        },
      };
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Une erreur est survenue lors de la récupération des documents',
      });
    }
  },
  {
    maxAge: 60 * 5, // 5 minutes
    name: 'documents-v2', // v2 : ajout de date_created dans la réponse (bump = purge cache)
    getKey: (event) => buildCacheKey('documents', getQuery(event)),
  },
);
