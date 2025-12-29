
/**
 * Endpoint pour récupérer les statistiques globales d'une élection
 * Route: /api/elections/dashboard/stats
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getLocalCmsClient();
    const query = getQuery(event);
    const year = parseInt(query.year as string);
    const type = query.type as string;

    if (!year || !type) {
        return {
            participation: { global: 0, byHour: [] },
            results: { totalVotes: 0, registered: 0 }
        };
    }

    try {
      // Pour l'instant, on renvoie des données de base ou simulées basées sur la collection 'carte'
      // Dans une version finale, on agrégerait les données de 'resultats'

      const stats = {
          participation: {
              global: 54.5,
              byHour: [
                  { hour: '10h', rate: 15.2 },
                  { hour: '12h', rate: 28.4 },
                  { hour: '14h', rate: 42.1 },
                  { hour: '17h', rate: 51.8 }
              ]
          },
          summary: {
              registered: 7371890,
              voted: 4017650,
              validVotes: 3982410,
              nullVotes: 35240
          }
      };

      return stats;
    } catch (error) {
      console.error("Error fetching election stats:", error);
      return {
        participation: { global: 0, byHour: [] },
        summary: { registered: 0, voted: 0 }
      };
    }
  },
  {
    maxAge: 60 * 60,
    name: "elections-dashboard-stats",
    getKey: (event) => {
      const query = getQuery(event);
      return `elections-stats-${query.year}-${query.type}`;
    },
  }
);
