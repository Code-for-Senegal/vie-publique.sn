import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      // Récupérer toutes les années publiées avec leurs versions
      const years = await directus.request(
        readItems('budget_year', {
          fields: ['id', 'year', 'status'],
          filter: {
            status: { _eq: 'published' },
          },
          sort: ['-year'],
          limit: -1,
        }),
      );

      if (!years || years.length === 0) {
        return {
          years: [],
          versions: [],
          latest: null,
        };
      }

      // Pour chaque année, récupérer ses versions publiées
      const yearsWithVersions = await Promise.all(
        years.map(async (year: any) => {
          const versions = await directus.request(
            readItems('budget_version', {
              fields: ['id', 'label', 'status'],
              filter: {
                year: { _eq: year.id }, // Utiliser l'ID de l'année, pas year.year
                status: { _eq: 'published' },
              },
              sort: ['label'], // PLF, LFI, LFR dans l'ordre
              limit: -1,
            }),
          );

          return {
            year: year.year,
            yearId: year.id,
            versions: versions.map((v: any) => ({
              id: v.id,
              label: v.label,
            })),
          };
        }),
      );

      // Filtrer les années qui ont au moins une version
      const validYears = yearsWithVersions.filter((y) => y.versions.length > 0);

      // Trouver la version la plus récente (dernière année, dernière version alphabétique)
      let latest = null;
      if (validYears.length > 0) {
        const latestYear = validYears[0]; // Déjà trié par année DESC
        // LFR > LFI > PLF (ordre alphabétique inversé pour avoir la plus récente)
        const versionOrder = ['LFR', 'LFI', 'PLF'];
        const latestVersion =
          latestYear.versions.find((v: any) => versionOrder.includes(v.label)) ||
          latestYear.versions[latestYear.versions.length - 1];

        latest = {
          year: latestYear.year,
          versionId: latestVersion.id,
          versionLabel: latestVersion.label,
        };
      }

      return {
        years: validYears,
        latest,
      };
    } catch (error: any) {
      console.error('Erreur récupération années budgétaires:', error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des années budgétaires',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 minutes en prod, pas de cache en dev
    name: 'budget-years',
    getKey: () => 'budget-years-list',
  },
);
