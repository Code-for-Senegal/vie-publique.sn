// server/api/elections/stats/professions.get.ts
import { readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer les statistiques des professions des candidats
 * Route: /api/elections/stats/professions
 *
 * Query params:
 * - coalition: Filtrer par ID de coalition (optionnel)
 *
 * Retourne le nombre de candidats par profession
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);
    const coalitionId = query.coalition as string | undefined;

    try {
      // Construire le filtre seulement si nécessaire
      const hasFilter = Boolean(coalitionId);
      const filter: any = hasFilter
        ? {
            electoral_list: {
              coalition: {
                id: { _eq: coalitionId },
              },
            },
          }
        : undefined;

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
      const professionCounts = candidates.reduce((acc: Record<string, number>, candidate: { profession?: string }) => {
        const profession = candidate.profession || "Non renseigné";
        if (!acc[profession]) {
          acc[profession] = 0;
        }
        acc[profession]++;
        return acc;
      }, {} as Record<string, number>);

      // Transformer en format attendu et trier par count
      const statsData = Object.entries(professionCounts)
        .map(([profession, count]) => ({
          profession,
          count: {
            id: count,
          },
        }))
        .sort((a, b) => (b.count.id as number) - (a.count.id as number));

      return {
        data: statsData,
      };
    } catch (error) {
      console.error("Error fetching election professions stats:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des statistiques des professions",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-stats-professions",
    getKey: (event) => {
      const query = getQuery(event);
      return `election-stats-professions-${query.coalition || "all"}`;
    },
  }
);
