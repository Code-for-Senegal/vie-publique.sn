import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);

    const directus = getCmsClient();

    // Paramètres de requête
    const year = query.year ? parseInt(query.year as string) : 2025;
    const versionId = query.version ? parseInt(query.version as string) : null;
    const level = (query.level as string) || 'ministry'; // ministry ou institution
    const compareYear = query.compareYear ? parseInt(query.compareYear as string) : null;
    const compareVersion = query.compareVersion ? parseInt(query.compareVersion as string) : null;

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
            'public_entity',
            'level',
            'code',
            'amount_cp',
            'unit',
            'public_entity.name',
            'public_entity.id',
            'public_entity.slug',
            'public_entity.logo',
          ],
          filter: {
            year: { _eq: year },
            version: { _eq: resolvedVersionId },
            level: { _eq: level },
          },
        }),
      );

      // Récupérer les données pour comparaison si demandé
      let compareItems: any[] = [];

      if (compareYear && compareVersion) {
        try {
          // Récupérer les lignes budgétaires de comparaison
          compareItems = await directus.request(
            readItems('budget_line', {
              fields: ['id', 'public_entity', 'amount_cp'],
              filter: {
                year: { _eq: compareYear },
                version: { _eq: compareVersion },
                level: { _eq: level },
              },
            }),
          );
        } catch (err) {
          console.warn(
            `[Ministries API] Impossible de récupérer les données de ${compareYear}:`,
            err,
          );
        }
      }

      // Enrichir les données avec la variation
      const enrichedItems = items.map((item: any) => {
        // Matching par ID d'entité (item.public_entity est un objet, compareItem.public_entity est un ID)
        const itemEntityId =
          typeof item.public_entity === 'object' ? item.public_entity.id : item.public_entity;
        const compareItem = compareItems.find((c: any) => {
          const compareEntityId =
            typeof c.public_entity === 'object' ? c.public_entity.id : c.public_entity;
          return compareEntityId === itemEntityId;
        });
        let variation_percentage = null;
        let variation_color: 'green' | 'red' | 'gray' = 'gray';
        let previous_amount = null;

        if (compareItem && compareItem.amount_cp) {
          previous_amount = parseFloat(compareItem.amount_cp);
          const currentAmount = parseFloat(item.amount_cp);

          if (previous_amount > 0) {
            const variation = ((currentAmount - previous_amount) / previous_amount) * 100;
            variation_percentage = `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
            variation_color = variation >= 0 ? 'green' : 'red';
          }
        }

        return {
          ...item,
          variation_percentage,
          variation_color,
          previous_amount,
        };
      });

      return {
        year,
        version: resolvedVersionId,
        level,
        ministries: enrichedItems || [], // Nom générique conservé pour compatibilité
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
      const compareKey =
        query.compareYear && query.compareVersion
          ? `-vs-${query.compareYear}-${query.compareVersion}`
          : '';
      return `budget-ministries-${query.year || 2025}-${query.version || 'latest'}-${query.level || 'ministry'}${compareKey}`;
    },
  },
);
