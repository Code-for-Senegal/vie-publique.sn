import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const currentYear = query.currentYear ? parseInt(query.currentYear as string) : new Date().getFullYear();
    const currentVersionId = query.currentVersion ? parseInt(query.currentVersion as string) : undefined;
    const compareYear = query.compareYear ? parseInt(query.compareYear as string) : currentYear - 1;

    try {
      const directus = getCmsClient();

      // Récupérer les données courantes
      const currentData = await $fetch('/api/budget/global', {
        query: { year: currentYear, version: currentVersionId },
      });

      // Récupérer l'ID de budget_year pour l'année de comparaison
      const compareBudgetYears = await directus.request(
        readItems('budget_year', {
          fields: ['id', 'year'],
          filter: {
            year: { _eq: compareYear },
          },
          limit: 1,
        }),
      );

      // Si pas d'année de comparaison, retourner les données courantes sans comparaison
      if (!compareBudgetYears || compareBudgetYears.length === 0) {
        return {
          current: currentData,
          compare: null,
          hasComparison: false,
        };
      }

      const compareBudgetYearId = compareBudgetYears[0].id;

      // Récupérer toutes les versions publiées de l'année de comparaison
      const allVersions = await directus.request(
        readItems('budget_version', {
          fields: ['id', 'label', 'status'],
          filter: {
            year: { _eq: compareBudgetYearId },
            status: { _eq: 'published' },
          },
        }),
      );

      if (!allVersions || allVersions.length === 0) {
        return {
          current: currentData,
          compare: null,
          hasComparison: false,
        };
      }

      // Appliquer la priorité : LFR > LFI > PLF
      const priorityOrder = ['LFR', 'LFI', 'PLF'];
      let compareVersionIdResolved;

      for (const label of priorityOrder) {
        const found = allVersions.find((v: any) => v.label === label);
        if (found) {
          compareVersionIdResolved = found.id;
          break;
        }
      }

      // Si aucune version avec ces labels, prendre la première disponible
      if (!compareVersionIdResolved) {
        compareVersionIdResolved = allVersions[0].id;
      }

      // Récupérer les données de comparaison
      const compareData = await $fetch('/api/budget/global', {
        query: { year: compareYear, version: compareVersionIdResolved },
      });

      return {
        current: currentData,
        compare: compareData,
        hasComparison: true,
        compareYear,
        compareVersionId: compareVersionIdResolved,
      };
    } catch (error: any) {
      console.error('Erreur récupération données de comparaison:', error);

      // En cas d'erreur, retourner au moins les données courantes
      try {
        const currentData = await $fetch('/api/budget/global', {
          query: { year: currentYear, version: currentVersionId },
        });

        return {
          current: currentData,
          compare: null,
          hasComparison: false,
        };
      } catch (fallbackError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Erreur lors de la récupération des données budgétaires',
        });
      }
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 60 * 60 : 0,
    name: 'budget-compare',
    getKey: (event) => {
      const query = getQuery(event);
      return `budget-compare-${query.currentYear || 'current'}-${query.currentVersion || 'latest'}-vs-${query.compareYear || 'prev'}`;
    },
  },
);
