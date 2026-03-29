import { readItems } from '@directus/sdk';
import type { PublicProjectDetailResponse } from '~~/types/public-project';

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug');

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug manquant',
      });
    }

    try {
      const directus = getCmsClient();

      // 1. Récupérer le projet avec toutes les relations
      const projects = await directus.request(
        readItems('public_project', {
          fields: [
            'id',
            'title',
            'short_title',
            'slug',
            'code',
            'summary',
            'description',
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
            'title_source_raw',
            'year_label',
            'version_label',
            'year_label_amount_ae',
            'year_label_amount_cp',
            'sector.id',
            'sector.name',
            'sector.color',
            'sector.icon',
            'ministry.id',
            'ministry.name',
            'ministry.public_slug',
            'policy_primary.id',
            'policy_primary.title',
            'policy_primary.slug',
            'document_primary.id',
            'document_primary.title',
            'document_primary.slug',
            'document_primary.file',
            'link_website',
            'link_facebook',
            'link_linkedin',
            'link_twitter',
          ],
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' },
          },
          limit: 1,
        }),
      );

      if (!projects || projects.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Projet "${slug}" introuvable`,
        });
      }

      const p = projects[0] as any;

      // 2. Récupérer les budgets annuels du projet
      const budgetYearItems = await directus.request(
        readItems('public_project_budget_year', {
          fields: [
            'id',
            'year.id',
            'year.year',
            'version.id',
            'version.label',
            'amount',
            'amount_ae',
            'amount_cp',
            'source_document.id',
            'source_document.title',
            'source_document.slug',
            'source_document.file',
          ],
          filter: {
            project: { _eq: p.id },
            status: { _eq: 'published' },
          },
          sort: ['-year.year'],
          limit: -1,
        }),
      );

      // 3. Récupérer les documents liés (relation M2M)
      let linkedDocuments: any[] = [];
      try {
        const docRelations = await directus.request(
          readItems('public_project', {
            fields: [
              'documents.documents_id.id',
              'documents.documents_id.title',
              'documents.documents_id.slug',
              'documents.documents_id.file',
            ],
            filter: { id: { _eq: p.id } },
            limit: 1,
          }),
        );
        linkedDocuments = (docRelations[0] as any)?.documents || [];
      } catch {
        // La relation documents peut ne pas exister
      }

      // 4. Récupérer les politiques liées (relation M2M)
      let linkedPolicies: any[] = [];
      try {
        const policyRelations = await directus.request(
          readItems('public_project', {
            fields: [
              'policies.public_policy_id.id',
              'policies.public_policy_id.title',
              'policies.public_policy_id.slug',
            ],
            filter: { id: { _eq: p.id } },
            limit: 1,
          }),
        );
        linkedPolicies = (policyRelations[0] as any)?.policies || [];
      } catch {
        // La relation policies peut ne pas exister
      }

      // 5. Récupérer les localisations
      let locations: any[] = [];
      try {
        const locRelations = await directus.request(
          readItems('public_project', {
            fields: ['public_project_location.*'],
            filter: { id: { _eq: p.id } },
            limit: 1,
          }),
        );
        locations = (locRelations[0] as any)?.public_project_location || [];
      } catch {
        // La relation locations peut ne pas exister
      }

      // Formater le projet
      const project = {
        id: p.id,
        title: p.title,
        shortTitle: p.short_title || null,
        slug: p.slug,
        code: p.code || null,
        summary: p.summary || null,
        description: p.description || null,
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
        yearLabel: p.year_label || null,
        versionLabel: p.version_label || null,
        yearLabelAmountAE: p.year_label_amount_ae || null,
        yearLabelAmountCP: p.year_label_amount_cp || null,
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
          ? {
              id: p.policy_primary.id,
              title: p.policy_primary.title,
            }
          : null,
        documentPrimary: p.document_primary
          ? {
              id: String(p.document_primary.id),
              title: p.document_primary.title,
              slug: p.document_primary.slug,
              file: p.document_primary.file || null,
            }
          : null,
        documents: linkedDocuments
          .filter((d: any) => d.documents_id)
          .map((d: any) => ({
            id: String(d.documents_id.id),
            title: d.documents_id.title,
            slug: d.documents_id.slug,
            file: d.documents_id.file || null,
          })),
        policies: linkedPolicies
          .filter((p: any) => p.public_policy_id)
          .map((p: any) => ({
            id: p.public_policy_id.id,
            title: p.public_policy_id.title,
            slug: p.public_policy_id.slug,
          })),
        locations,
        linkWebsite: p.link_website || null,
        linkFacebook: p.link_facebook || null,
        linkLinkedin: p.link_linkedin || null,
        linkTwitter: p.link_twitter || null,
        // Champs annuels non fournis en mode détail (pas de filtre année)
        annualAE: null,
        annualCP: null,
      };

      // Formater les budgets annuels
      const budgetYears = (budgetYearItems as any[]).map((b) => ({
        id: b.id,
        year: b.year?.year || 0,
        yearLabel: String(b.year?.year || ''),
        version: b.version?.label || '',
        versionLabel: b.version?.label || '',
        amount: b.amount ? Number(b.amount) : null,
        amountAE: b.amount_ae ? Number(b.amount_ae) : null,
        amountCP: b.amount_cp ? Number(b.amount_cp) : null,
        sourceDocument: b.source_document
          ? {
              id: String(b.source_document.id),
              title: b.source_document.title,
              slug: b.source_document.slug,
              file: b.source_document.file || null,
            }
          : null,
      }));

      const result: PublicProjectDetailResponse = {
        project,
        budgetYears,
      };

      return result;
    } catch (error: any) {
      // Re-throw createError
      if (error.statusCode) throw error;

      console.error('Erreur récupération détail projet public:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération du projet',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 0 * 60 : 0, // 0 min en prod
    name: 'public-project-detail',
    getKey: (event) => {
      const slug = getRouterParam(event, 'slug');
      return `public-project-detail-${slug}`;
    },
  },
);
