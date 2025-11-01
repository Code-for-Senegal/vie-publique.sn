import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const year = query.year ? parseInt(query.year as string) : new Date().getFullYear();
    const versionId = query.version ? parseInt(query.version as string) : undefined;

    try {
      const directus = getCmsClient();

      // 1. Récupérer la version si non fournie (dernière version publiée de l'année)
      let budgetVersionId = versionId;
      if (!budgetVersionId) {
        const versions = await directus.request(
          readItems('budget_version', {
            fields: ['id', 'label', 'status'],
            filter: {
              year: { _eq: year },
              status: { _eq: 'published' },
            },
            sort: ['-id'],
            limit: 1,
          }),
        );

        if (!versions || versions.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: `Aucune version budgétaire publiée pour l'année ${year}`,
          });
        }

        budgetVersionId = versions[0].id;
      }

      // 2. Récupérer tous les indicateurs globaux avec leurs valeurs
      const budgetGlobalData = await directus.request(
        readItems('budget_global', {
          fields: [
            'id',
            'amount',
            'note',
            'metric.id',
            'metric.code',
            'metric.label_fr',
            'metric.unit',
            'metric.group',
            'metric.display_zone',
            'metric.display_order',
            'metric.color',
          ],
          filter: {
            year: { _eq: year },
            version: { _eq: budgetVersionId },
            status: { _eq: 'published' },
          },
          sort: ['metric.display_order'],
          limit: -1,
        }),
      );

      if (!budgetGlobalData || budgetGlobalData.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Aucune donnée budgétaire trouvée pour l'année ${year}`,
        });
      }

      // 3. Récupérer les documents liés à cette année
      const yearData = await directus.request(
        readItems('budget_year', {
          fields: [
            'id',
            'year',
            'documents.documents_id.id',
            'documents.documents_id.slug',
            'documents.documents_id.title',
            'documents.documents_id.file',
            'documents.documents_id.cover_image',
          ],
          filter: {
            year: { _eq: year },
          },
          limit: 1,
        }),
      );

      const documents =
        yearData && yearData.length > 0 && yearData[0].documents
          ? yearData[0].documents
              .map((doc: any) => doc.documents_id)
              .filter((d: any) => d && d.id)
          : [];

      // 4. Organiser les données par groupes
      const keyIndicators = budgetGlobalData.filter(
        (item: any) => item.metric?.display_zone === 'resume',
      );

      const revenues = budgetGlobalData.filter((item: any) => item.metric?.group === 'revenues');

      const expenses = budgetGlobalData.filter((item: any) => item.metric?.group === 'expenses');

      const financing = budgetGlobalData.filter((item: any) => item.metric?.group === 'financing');

      const debt = budgetGlobalData.filter((item: any) => item.metric?.group === 'debt');

      return {
        year,
        versionId: budgetVersionId,
        documents,
        keyIndicators: keyIndicators.map((item: any) => ({
          code: item.metric?.code,
          label: item.metric?.label_fr,
          value: parseFloat(item.amount),
          unit: item.metric?.unit,
          color: item.metric?.color,
          note: item.note,
        })),
        revenues: revenues.map((item: any) => ({
          code: item.metric?.code,
          label: item.metric?.label_fr,
          value: parseFloat(item.amount),
          unit: item.metric?.unit,
          color: item.metric?.color,
        })),
        expenses: expenses.map((item: any) => ({
          code: item.metric?.code,
          label: item.metric?.label_fr,
          value: parseFloat(item.amount),
          unit: item.metric?.unit,
          color: item.metric?.color,
        })),
        financing: financing.map((item: any) => ({
          code: item.metric?.code,
          label: item.metric?.label_fr,
          value: parseFloat(item.amount),
          unit: item.metric?.unit,
          color: item.metric?.color,
        })),
        debt: debt.map((item: any) => ({
          code: item.metric?.code,
          label: item.metric?.label_fr,
          value: parseFloat(item.amount),
          unit: item.metric?.unit,
          color: item.metric?.color,
        })),
        allMetrics: budgetGlobalData.map((item: any) => ({
          code: item.metric?.code,
          label: item.metric?.label_fr,
          value: parseFloat(item.amount),
          unit: item.metric?.unit,
          group: item.metric?.group,
          displayZone: item.metric?.display_zone,
          color: item.metric?.color,
        })),
      };
    } catch (error: any) {
      console.error('Erreur récupération budget global:', error);

      // Si l'erreur vient de createError, on la renvoie directement
      if (error.statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des données budgétaires',
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'budget-global',
    getKey: (event) => {
      const query = getQuery(event);
      return `budget-global-${query.year || 'current'}-${query.version || 'latest'}`;
    },
  },
);
