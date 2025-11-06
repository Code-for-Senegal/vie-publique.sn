import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();

    try {
      // 1. Récupérer toutes les années et versions
      const years = await directus.request(
        readItems('budget_year', {
          fields: ['id', 'year', 'status'],
          filter: {
            status: { _eq: 'published' },
          },
          sort: ['year'],
        }),
      );

      const priorityOrder = ['LFR', 'LFI', 'PLF'];
      const revenueEvolution: any[] = [];
      const expenseEvolution: any[] = [];
      const financingEvolution: any[] = [];
      const debtEvolution: any[] = [];

      // 2. Pour chaque année, trouver la version prioritaire et calculer les totaux
      for (const yearData of years) {
        // Récupérer les versions de cette année
        const versions = await directus.request(
          readItems('budget_version', {
            fields: ['id', 'label', 'status'],
            filter: {
              year: { _eq: yearData.id },
              status: { _eq: 'published' },
            },
          }),
        );

        // Sélectionner la version selon priorité LFR > LFI > PLF
        let selectedVersion = null;
        for (const label of priorityOrder) {
          const found = versions.find((v: any) => v.label === label);
          if (found) {
            selectedVersion = found;
            break;
          }
        }

        if (!selectedVersion) continue;

        // Récupérer les métriques pour cette année/version
        const metrics = await directus.request(
          readItems('budget_global', {
            fields: ['id', 'amount', 'metric.code', 'metric.group'],
            filter: {
              year: { _eq: yearData.year },
              version: { _eq: selectedVersion.id },
              status: { _eq: 'published' },
            },
          }),
        );

        // Calculer le total des recettes
        const revenueMetrics = metrics.filter((m: any) => m.metric?.group === 'revenues');
        const revenueTotal = revenueMetrics.reduce(
          (sum: number, m: any) => sum + parseFloat(m.amount || 0),
          0,
        );

        // Calculer le total des dépenses
        const expenseMetrics = metrics.filter((m: any) => m.metric?.group === 'expenses');
        const expenseTotal = expenseMetrics.reduce(
          (sum: number, m: any) => sum + parseFloat(m.amount || 0),
          0,
        );

        // Calculer le total des besoins de financement (trésorerie)
        const financingMetrics = metrics.filter((m: any) => m.metric?.group === 'financing');
        const financingTotal = financingMetrics.reduce(
          (sum: number, m: any) => sum + parseFloat(m.amount || 0),
          0,
        );

        // Calculer le total du service de la dette
        const debtMetrics = metrics.filter((m: any) => m.metric?.group === 'debt');
        const debtTotal = debtMetrics.reduce(
          (sum: number, m: any) => sum + parseFloat(m.amount || 0),
          0,
        );

        revenueEvolution.push({
          year: yearData.year.toString(),
          amount: revenueTotal,
          label: `${yearData.year} (${selectedVersion.label})`,
          versionLabel: selectedVersion.label,
        });

        expenseEvolution.push({
          year: yearData.year.toString(),
          amount: expenseTotal,
          label: `${yearData.year} (${selectedVersion.label})`,
          versionLabel: selectedVersion.label,
        });

        financingEvolution.push({
          year: yearData.year.toString(),
          amount: financingTotal,
          label: `${yearData.year} (${selectedVersion.label})`,
          versionLabel: selectedVersion.label,
        });

        debtEvolution.push({
          year: yearData.year.toString(),
          amount: debtTotal,
          label: `${yearData.year} (${selectedVersion.label})`,
          versionLabel: selectedVersion.label,
        });
      }

      return {
        revenueEvolution,
        expenseEvolution,
        financingEvolution,
        debtEvolution,
      };
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'évolution budgétaire:", error);
      throw createError({
        statusCode: error.statusCode || 500,
        message: error.message || "Erreur lors de la récupération de l'évolution",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: 'budget-evolution',
    getKey: () => 'budget-evolution-all',
  },
);
