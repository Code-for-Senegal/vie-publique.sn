import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug');

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: "Le slug de l'entité est requis",
      });
    }

    const directus = getCmsClient();

    try {
      // 1. UNE SEULE REQUÊTE : Récupérer toutes les lignes budgétaires de l'entité
      const allBudgetLines = await directus.request(
        readItems('budget_line', {
          fields: [
            'id',
            'year',
            'version',
            'level',
            'label',
            'code',
            'amount_ae',
            'amount_cp',
            'public_entity.id',
            'public_entity.name',
            'public_entity.slug',
            'version.id',
            'version.label',
          ],
          filter: {
            public_entity: {
              slug: { _eq: slug },
            },
            status: { _eq: 'published' },
          },
          sort: ['year', 'version', 'level'],
        }),
      );

      if (!allBudgetLines || allBudgetLines.length === 0) {
        throw createError({
          statusCode: 404,
          message: 'Entité non trouvée ou aucune donnée budgétaire disponible',
        });
      }

      // 2. Extraire les infos de l'entité depuis la première ligne
      const entity = {
        id: allBudgetLines[0].public_entity.id,
        name: allBudgetLines[0].public_entity.name,
        slug: allBudgetLines[0].public_entity.slug,
      };

      // 3. Séparer les lignes par level
      const ministryOrInstitutionLines = allBudgetLines.filter(
        (line: any) => line.level === 'ministry' || line.level === 'institution',
      );
      const programLines = allBudgetLines.filter((line: any) => line.level === 'program');

      // Déterminer le level (ministry ou institution) depuis les données
      const level =
        ministryOrInstitutionLines.length > 0 ? ministryOrInstitutionLines[0].level : 'ministry';

      // Filtrer uniquement les lignes du bon level pour l'évolution
      const budgetLines = ministryOrInstitutionLines.filter((line: any) => line.level === level);

      // 4. Grouper les données par année ET version pour l'évolution
      const evolutionByYearVersion = budgetLines.reduce((acc: any, line: any) => {
        const year = line.year;
        const versionId = line.version?.id || 0;
        const key = `${year}-${versionId}`; // Clé unique par année + version

        if (!acc[key]) {
          acc[key] = {
            year,
            amount_cp: 0,
            version_label: line.version?.label || 'N/A',
            version_id: versionId,
          };
        }
        acc[key].amount_cp = parseFloat(line.amount_cp || 0);
        return acc;
      }, {});

      // Trier par année, puis par version (en utilisant l'ordre naturel)
      const evolution = Object.values(evolutionByYearVersion).sort((a: any, b: any) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        // Si même année, trier par version_id
        return a.version_id - b.version_id;
      });

      // 5. Récupérer la dernière année disponible
      const latestYear = evolution.length > 0 ? (evolution[evolution.length - 1] as any) : null;

      // 6. Filtrer les programmes de la dernière année (déjà récupérés dans allBudgetLines)
      let programs: any[] = [];
      if (latestYear) {
        programs = programLines.filter((line: any) => line.year === (latestYear as any).year);

        // Trier par montant décroissant
        programs.sort(
          (a: any, b: any) => parseFloat(b.amount_cp || 0) - parseFloat(a.amount_cp || 0),
        );
      }

      // 7. Calculer les variations année N vs N-1 pour les programmes
      // Utiliser les données déjà récupérées au lieu de faire de nouvelles requêtes
      const programsWithVariation = programs.map((program: any) => {
        const currentYear = program.year;
        const previousYear = currentYear - 1;

        // Chercher le même programme l'année précédente dans programLines
        const previousYearProgram = programLines.find(
          (line: any) => line.year === previousYear && line.code === program.code,
        );

        let variation_percentage = 'N/A';
        let variation_color = 'gray';

        if (previousYearProgram) {
          const previousAmount = parseFloat(previousYearProgram.amount_cp || 0);
          const currentAmount = parseFloat(program.amount_cp || 0);

          if (previousAmount > 0) {
            const variation = ((currentAmount - previousAmount) / previousAmount) * 100;
            variation_percentage = `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`;
            variation_color = variation > 0 ? 'green' : variation < 0 ? 'red' : 'gray';
          }
        }

        return {
          ...program,
          variation_percentage,
          variation_color,
        };
      });

      return {
        entity: {
          id: entity.id,
          name: entity.name,
          slug: entity.slug,
        },
        level,
        evolution,
        latestYear,
        programs: programsWithVariation,
      };
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'entité budgétaire:", error);
      throw createError({
        statusCode: error.statusCode || 500,
        message: error.message || "Erreur lors de la récupération des données de l'entité",
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 60 * 60 : 0, // 1h en prod, pas de cache en dev
    getKey: (event) => {
      const slug = getRouterParam(event, 'slug');
      return `budget-entity-${slug}`;
    },
  },
);
