import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);

    const directus = getCmsClient();

    // Paramètres de requête
    const year = query.year ? parseInt(query.year as string) : 2025;
    const versionId = query.version ? parseInt(query.version as string) : null;
    const level = (query.level as string) || 'ministry'; // ministry ou institution

    try {
      // Si pas de version spécifiée, récupérer la dernière version publiée
      let resolvedVersionId = versionId;

      if (!resolvedVersionId) {
        const budgetYear = await directus.request(
          readItems('budget_year', {
            fields: ['id', 'year', 'status'],
            filter: {
              year: { _eq: year },
              status: { _eq: 'published' },
            },
            limit: 1,
          }),
        );

        if (!budgetYear || budgetYear.length === 0) {
          throw createError({
            statusCode: 404,
            message: `Aucune année budgétaire trouvée pour ${year}`,
          });
        }

        const budgetYearId = budgetYear[0].id;

        // Récupérer toutes les versions publiées pour cette année
        const allVersions = await directus.request(
          readItems('budget_version', {
            fields: ['id', 'label', 'status'],
            filter: {
              year: { _eq: budgetYearId },
              status: { _eq: 'published' },
            },
          }),
        );

        if (!allVersions || allVersions.length === 0) {
          throw createError({
            statusCode: 404,
            message: `Aucune version budgétaire publiée pour ${year}`,
          });
        }

        // Priorité : LFR > LFI > PLF
        const priorityOrder = ['LFR', 'LFI', 'PLF'];
        for (const label of priorityOrder) {
          const found = allVersions.find((v: any) => v.label === label);
          if (found) {
            resolvedVersionId = found.id;
            break;
          }
        }

        if (!resolvedVersionId) {
          resolvedVersionId = allVersions[0].id;
        }
      }

      // Récupérer les lignes budgétaires (ministères ou institutions)
      const items = await directus.request(
        readItems('budget_line', {
          fields: [
            'id',
            'year',
            'label',
            'version',
            'entity',
            'level',
            'code',
            'amount_cp',
            'unit',
            'entity.name',
            'entity.id',
            'entity.public_slug',
          ],
          filter: {
            year: { _eq: year },
            version: { _eq: resolvedVersionId },
            level: { _eq: level },
          },
        }),
      );

      return {
        year,
        version: resolvedVersionId,
        level,
        ministries: items || [], // Nom générique conservé pour compatibilité
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des ministères:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        message: error.message || 'Erreur lors de la récupération des données',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 minutes en prod, pas de cache en dev
    getKey: (event) => {
      const query = getQuery(event);
      return `budget-ministries-${query.year || 2025}-${query.version || 'latest'}-${query.level || 'ministry'}`;
    },
  },
);
