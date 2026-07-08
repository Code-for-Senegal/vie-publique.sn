import { readItems } from '@directus/sdk';
import type { PublicProjectFilters } from '~~/types/public-project';

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      // 1. Secteurs
      const sectors = await directus.request(
        readItems('public_project_sector', {
          fields: ['id', 'name', 'slug', 'code', 'color', 'icon', 'sort_order'],
          filter: { status: { _eq: 'published' } },
          sort: ['sort_order', 'name'],
          limit: -1,
        }),
      );

      // 2. Politiques publiques / axes
      const policies = await directus.request(
        readItems('public_policy', {
          fields: ['id', 'title', 'slug', 'policy_type', 'code'],
          filter: { status: { _eq: 'published' } },
          sort: ['sort_order', 'title'],
          limit: -1,
        }),
      );

      // 3. Années et versions budgétaires (réutilise budget_year / budget_version)
      const budgetYears = await directus.request(
        readItems('budget_year', {
          fields: ['id', 'year'],
          filter: { status: { _eq: 'published' } },
          sort: ['-year'],
          limit: -1,
        }),
      );

      const budgetVersions = await directus.request(
        readItems('budget_version', {
          fields: ['id', 'label', 'year'],
          filter: { status: { _eq: 'published' } },
          sort: ['date'],
          limit: -1,
        }),
      );

      // 4. Ministères référencés par les projets (via state_entity)
      const projects = await directus.request(
        readItems('public_project', {
          fields: ['ministry.id', 'ministry.name'],
          filter: {
            status: { _eq: 'published' },
            ministry: { _nnull: true },
          },
          limit: -1,
        }),
      );

      // Déduplique les ministères
      const ministryMap = new Map<number, string>();
      for (const p of projects as any[]) {
        if (p.ministry?.id && p.ministry?.name) {
          ministryMap.set(p.ministry.id, p.ministry.name);
        }
      }
      const ministries = Array.from(ministryMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

      // 5. Régions distinctes
      const projectsWithRegion = await directus.request(
        readItems('public_project', {
          fields: ['region_primary_label'],
          filter: {
            status: { _eq: 'published' },
            region_primary_label: { _nnull: true, _nempty: true },
          },
          limit: -1,
        }),
      );

      const regionSet = new Set<string>();
      for (const p of projectsWithRegion as any[]) {
        if (p.region_primary_label) {
          regionSet.add(p.region_primary_label);
        }
      }
      const regions = Array.from(regionSet).sort((a, b) => a.localeCompare(b, 'fr'));

      const result: PublicProjectFilters = {
        sectors: (sectors as any[]).map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          code: s.code || null,
          color: s.color || null,
          icon: s.icon || null,
          sortOrder: s.sort_order || null,
        })),
        policies: (policies as any[]).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          policyType: p.policy_type || null,
          code: p.code || null,
        })),
        years: (budgetYears as any[]).map((y) => ({
          year: y.year,
          yearId: y.id,
        })),
        versions: (budgetVersions as any[]).map((v) => ({
          id: v.id,
          label: v.label,
          yearId: v.year,
        })),
        ministries,
        regions,
      };

      return result;
    } catch (error: any) {
      console.error('Erreur récupération filtres projets publics:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des filtres',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 min en prod
    name: 'public-projects-filters',
    getKey: () => 'public-projects-filters',
  },
);
