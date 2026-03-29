import { readItems, aggregate } from '@directus/sdk';
import type { PublicProjectListResponse } from '~~/types/public-project';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 25;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || '-budget_total_amount';
    const sectorId = query.sector ? parseInt(query.sector as string) : null;
    const policyId = query.policy ? parseInt(query.policy as string) : null;
    const ministryId = query.ministry ? parseInt(query.ministry as string) : null;
    const region = query.region as string;
    const yearParam = query.year ? parseInt(query.year as string) : null;
    const versionParam = query.version ? parseInt(query.version as string) : null;
    const isPres = query.isPres as string;
    const isPriority = query.isPriority as string;

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: { _eq: 'published' },
      };

      if (sectorId) {
        filter.sector = { _eq: sectorId };
      }

      if (policyId) {
        filter.policy_primary = { _eq: policyId };
      }

      if (ministryId) {
        filter.ministry = { _eq: ministryId };
      }

      if (region) {
        filter.region_primary_label = { _eq: region };
      }

      if (isPres === 'true') {
        filter.is_in_pres = { _eq: true };
      } else if (isPres === 'false') {
        filter.is_in_pres = { _eq: false };
      }

      if (isPriority === 'true') {
        filter.is_priority = { _eq: true };
      } else if (isPriority === 'false') {
        filter.is_priority = { _eq: false };
      }

      // Recherche textuelle
      if (search) {
        filter._or = [
          { title: { _icontains: search } },
          { short_title: { _icontains: search } },
          { code: { _icontains: search } },
          { summary: { _icontains: search } },
        ];
      }

      const offset = (page - 1) * limit;

      // Récupérer les projets
      const projects = await directus.request(
        readItems('public_project', {
          fields: [
            'id',
            'title',
            'short_title',
            'slug',
            'code',
            'summary',
            'is_in_pres',
            'is_in_pip',
            'is_priority',
            'budget_total_amount',
            'start_year',
            'end_year',
            'current_status_label',
            'current_delay_status_label',
            'current_program_label',
            'region_primary_label',
            'policy_primary_label',
            'ministry_label',
            'sector_label',
            'source_label',
            'sector.id',
            'sector.name',
            'sector.color',
            'sector.icon',
            'ministry.id',
            'ministry.name',
            'ministry.public_slug',
            'policy_primary.id',
            'policy_primary.title',
          ],
          filter,
          sort: [sortBy],
          limit,
          offset,
        }),
      );

      // Compter le total
      const countResult = await directus.request(
        aggregate('public_project', {
          aggregate: { count: ['id'] },
          query: { filter },
        }),
      );
      const total = Number(countResult[0]?.count?.id) || 0;

      // Si année spécifiée, récupérer les budgets annuels pour chaque projet
      let budgetByProject = new Map<number, { ae: number | null; cp: number | null }>();

      if (yearParam && projects.length > 0) {
        // Trouver le budget_year ID
        const budgetYears = await directus.request(
          readItems('budget_year', {
            fields: ['id'],
            filter: { year: { _eq: yearParam } },
            limit: 1,
          }),
        );

        if (budgetYears && budgetYears.length > 0) {
          const budgetYearId = budgetYears[0].id;
          const projectIds = (projects as any[]).map((p) => p.id);

          const budgetFilter: any = {
            status: { _eq: 'published' },
            year: { _eq: budgetYearId },
            project: { _in: projectIds },
          };

          if (versionParam) {
            budgetFilter.version = { _eq: versionParam };
          }

          const budgets = await directus.request(
            readItems('public_project_budget_year', {
              fields: ['project', 'amount_ae', 'amount_cp'],
              filter: budgetFilter,
              limit: -1,
            }),
          );

          for (const b of budgets as any[]) {
            const projectId = typeof b.project === 'object' ? b.project?.id : b.project;
            budgetByProject.set(projectId, {
              ae: b.amount_ae ? Number(b.amount_ae) : null,
              cp: b.amount_cp ? Number(b.amount_cp) : null,
            });
          }
        }
      }

      // Formater les résultats
      const formattedProjects = (projects as any[]).map((p) => ({
        id: p.id,
        title: p.title,
        shortTitle: p.short_title || null,
        slug: p.slug,
        code: p.code || null,
        summary: p.summary || null,
        isInPres: p.is_in_pres || false,
        isInPip: p.is_in_pip || false,
        isPriority: p.is_priority || false,
        budgetTotalAmount: p.budget_total_amount ? Number(p.budget_total_amount) : null,
        startYear: p.start_year || null,
        endYear: p.end_year || null,
        currentStatusLabel: p.current_status_label || null,
        currentDelayStatusLabel: p.current_delay_status_label || null,
        currentProgramLabel: p.current_program_label || null,
        regionPrimaryLabel: p.region_primary_label || null,
        sourceLabel: p.source_label || null,
        sector: p.sector
          ? {
              id: p.sector.id,
              name: p.sector.name,
              color: p.sector.color || null,
              icon: p.sector.icon || null,
            }
          : null,
        ministry: p.ministry
          ? { id: p.ministry.id, name: p.ministry.name, publicSlug: p.ministry.public_slug || null }
          : null,
        policyPrimary: p.policy_primary
          ? { id: p.policy_primary.id, title: p.policy_primary.title }
          : null,
        annualAE: budgetByProject.get(p.id)?.ae ?? null,
        annualCP: budgetByProject.get(p.id)?.cp ?? null,
      }));

      const result: PublicProjectListResponse = {
        projects: formattedProjects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return result;
    } catch (error: any) {
      console.error('Erreur récupération liste projets publics:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des projets publics',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 0 * 60 : 0, // 0 min en prod
    name: 'public-projects-list',
    getKey: (event) => {
      const query = getQuery(event);
      return `public-projects-list-${JSON.stringify(query)}`;
    },
  },
);
