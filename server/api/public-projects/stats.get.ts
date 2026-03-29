import { readItems, aggregate } from '@directus/sdk';
import type { PublicProjectStats } from '~~/types/public-project';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const yearParam = query.year ? parseInt(query.year as string) : null;
    const versionParam = query.version ? parseInt(query.version as string) : null;
    const isPresParam = query.isPres as string | undefined;

    try {
      const directus = getCmsClient();

      // Filtre de base (applicable a toutes les aggregations)
      const baseFilter: any = { status: { _eq: 'published' } };
      if (isPresParam === 'true') baseFilter.is_in_pres = { _eq: true };
      else if (isPresParam === 'false') baseFilter.is_in_pres = { _eq: false };

      // 1. Compter le total de projets publiés
      const totalResult = await directus.request(
        aggregate('public_project', {
          aggregate: { count: ['id'] },
          query: { filter: baseFilter },
        }),
      );
      const totalProjects = Number(totalResult[0]?.count?.id) || 0;

      // 2. Compter les projets PRES
      const presResult = await directus.request(
        aggregate('public_project', {
          aggregate: { count: ['id'] },
          query: { filter: { ...baseFilter, is_in_pres: { _eq: true } } },
        }),
      );
      const totalPres = Number(presResult[0]?.count?.id) || 0;

      // 3. Compter les projets PIP (non-PRES)
      const pipResult = await directus.request(
        aggregate('public_project', {
          aggregate: { count: ['id'] },
          query: { filter: { ...baseFilter, is_in_pres: { _eq: false } } },
        }),
      );
      const totalPip = Number(pipResult[0]?.count?.id) || 0;

      // 4. Compter les projets prioritaires
      const priorityResult = await directus.request(
        aggregate('public_project', {
          aggregate: { count: ['id'] },
          query: { filter: { ...baseFilter, is_priority: { _eq: true } } },
        }),
      );
      const totalPriority = Number(priorityResult[0]?.count?.id) || 0;

      // 5. Compter les ministères distincts
      const ministriesResult = await directus.request(
        aggregate('public_project', {
          aggregate: { countDistinct: ['ministry'] },
          query: {
            filter: { ...baseFilter, ministry: { _nnull: true } },
          },
        }),
      );
      const totalMinistries = Number(ministriesResult[0]?.countDistinct?.ministry) || 0;

      // 6. Compter les secteurs distincts
      const sectorsResult = await directus.request(
        aggregate('public_project', {
          aggregate: { countDistinct: ['sector'] },
          query: {
            filter: { ...baseFilter, sector: { _nnull: true } },
          },
        }),
      );
      const totalSectors = Number(sectorsResult[0]?.countDistinct?.sector) || 0;

      // 7. Budget total (somme budget_total_amount)
      const budgetResult = await directus.request(
        aggregate('public_project', {
          aggregate: { sum: ['budget_total_amount'] },
          query: { filter: baseFilter },
        }),
      );
      const totalBudget = budgetResult[0]?.sum?.budget_total_amount
        ? Number(budgetResult[0].sum.budget_total_amount)
        : null;

      // 8. Totaux AE / CP pour l'année/version sélectionnée
      let totalAE: number | null = null;
      let totalCP: number | null = null;
      let versionLabel: string | null = null;

      if (yearParam) {
        // Trouver le budget_year ID correspondant
        const budgetYears = await directus.request(
          readItems('budget_year', {
            fields: ['id', 'year'],
            filter: { year: { _eq: yearParam } },
            limit: 1,
          }),
        );

        if (budgetYears && budgetYears.length > 0) {
          const budgetYearId = budgetYears[0].id;

          // Construire le filtre budget_year
          const budgetFilter: any = {
            status: { _eq: 'published' },
            year: { _eq: budgetYearId },
          };

          // Filtrer par isPres sur la relation projet
          if (isPresParam === 'true') {
            budgetFilter.project = { is_in_pres: { _eq: true } };
          } else if (isPresParam === 'false') {
            budgetFilter.project = { is_in_pres: { _eq: false } };
          }

          if (versionParam) {
            budgetFilter.version = { _eq: versionParam };

            // Récupérer le label de la version
            const versionItems = await directus.request(
              readItems('budget_version', {
                fields: ['label'],
                filter: { id: { _eq: versionParam } },
                limit: 1,
              }),
            );
            versionLabel = versionItems?.[0]?.label || null;
          }

          const aeResult = await directus.request(
            aggregate('public_project_budget_year', {
              aggregate: { sum: ['amount_ae', 'amount_cp'] },
              query: { filter: budgetFilter },
            }),
          );

          totalAE = aeResult[0]?.sum?.amount_ae ? Number(aeResult[0].sum.amount_ae) : null;
          totalCP = aeResult[0]?.sum?.amount_cp ? Number(aeResult[0].sum.amount_cp) : null;
        }
      }

      const result: PublicProjectStats = {
        totalProjects,
        totalPres,
        totalPip,
        totalPriority,
        totalMinistries,
        totalSectors,
        totalBudget,
        totalAE,
        totalCP,
        year: yearParam,
        versionLabel,
      };

      return result;
    } catch (error: any) {
      console.error('Erreur récupération stats projets publics:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des statistiques',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 min en prod
    name: 'public-projects-stats',
    getKey: (event) => {
      const query = getQuery(event);
      return `public-projects-stats-${query.year || 'all'}-${query.version || 'all'}-${query.isPres || 'all'}`;
    },
  },
);
