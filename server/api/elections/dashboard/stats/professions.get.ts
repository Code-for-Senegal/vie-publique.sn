import { readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer les statistiques des professions des candidats pour le dashboard
 * Route: /api/elections/dashboard/stats/professions
 *
 * Query params:
 * - coalition: Filtrer par ID de coalition (optionnel)
 * - year: Année de l'élection
 * - type: Type d'élection
 *
 * Retourne le nombre de candidats par profession
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);
    const coalitionId = query.coalition as string | undefined;
    const year = query.year ? parseInt(query.year as string) : null;
    const type = query.type as string;

    try {
      let electionFilter = {};

      // Si année et type sont fournis, récupérer l'ID de l'élection
      if (year && type) {
        const elections = await directus.request(
          readItems("elections", {
            fields: ["id"],
            filter: {
              year: { _eq: year },
              type: { _eq: type },
            },
            limit: 1,
          })
        );

        const electionId = elections[0]?.id;

        if (electionId) {
           electionFilter = {
               electoral_list: {
                   election: { _eq: electionId }
               }
           };
        } else {
             return { data: [] };
        }
      }

      // Construire le filtre global
      let filter: any = {};

      if (coalitionId) {
          filter = {
            electoral_list: {
              coalition: {
                id: { _eq: coalitionId },
              },
            },
          };
      }

      // Fusionner les filtres (élection et coalition)
      if (Object.keys(electionFilter).length > 0) {
          if (filter.electoral_list) {
              // Si déjà filtre coalition, on ajoute le filtre election dedans
              filter.electoral_list.election = (electionFilter as any).electoral_list.election;
          } else {
              filter = electionFilter;
          }
      } else if (!coalitionId) {
          filter = undefined;
      }

      // Récupérer tous les candidats avec leur profession
      const requestOptions: any = {
        fields: ["profession"],
        limit: -1, // Récupérer tous les candidats
      };

      // Ajouter le filtre uniquement s'il existe
      if (filter) {
        requestOptions.filter = filter;
      }

      const candidates = await directus.request(
        readItems("election_candidates", requestOptions)
      );

      // Agréger les données côté serveur
      const professionCounts = candidates.reduce((acc: Record<string, { count: number, label: string }>, candidate: { profession?: string }) => {
        const rawProfession = candidate.profession ? candidate.profession.trim() : "Non renseigné";
        const normalizedKey = rawProfession.toLowerCase();

        if (!acc[normalizedKey]) {
          // Utiliser la première occurrence comme label, ou une fonction de formatage
          // On peut forcer une majuscule au début
          const label = rawProfession.charAt(0).toUpperCase() + rawProfession.slice(1);
          acc[normalizedKey] = {
              count: 0,
              label: label
          };
        }
        acc[normalizedKey].count++;
        return acc;
      }, {} as Record<string, { count: number, label: string }>);

      // Transformer en format attendu et trier par count
      const statsData = Object.values(professionCounts)
        .map((entry) => ({
          profession: entry.label,
          count: {
            id: entry.count,
          },
        }))
        .sort((a, b) => (b.count.id as number) - (a.count.id as number));

      return {
        data: statsData,
      };
    } catch (error) {
      console.error("Error fetching dashboard election professions stats:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des statistiques des professions",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-dashboard-stats-professions",
    getKey: (event) => {
      const query = getQuery(event);
      return `election-dashboard-stats-professions-${query.coalition || "all"}-${query.year || "all"}-${query.type || "all"}`;
    },
  }
);
