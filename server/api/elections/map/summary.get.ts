// server/api/elections/map/summary.get.ts
import { aggregate } from '@directus/sdk';

/**
 * Endpoint pour récupérer le résumé des statistiques électorales
 * Route: /api/elections/map/summary
 *
 * Query params:
 * - election: ID de l'élection pour filtrer les données
 *
 * Retourne:
 * - Statistiques totales (national + diaspora)
 * - Statistiques nationales uniquement
 * - Statistiques diaspora uniquement
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);
    const electionId = query.election as string | undefined;

    try {
      // Construire le filtre avec l'élection si fournie
      const filter: any = {};
      if (electionId) {
        filter.election = { _eq: parseInt(electionId) };
      }

      // Récupérer les stats nationales
      const nationalStats = await directus.request(
        aggregate('election_map_national', {
          aggregate: {
            sum: ['voters'],
            count: ['office_number'],
            countDistinct: ['polling_place', 'department', 'municipality'],
          },
          query: {
            filter: Object.keys(filter).length > 0 ? filter : undefined,
          },
        }),
      );

      // Récupérer les stats diaspora
      const diasporaStats = await directus.request(
        aggregate('election_map_diaspora', {
          aggregate: {
            sum: ['voters'],
            count: ['office_number'],
            countDistinct: ['polling_place', 'country', 'locality', 'diplomatic_representation'],
          },
          query: {
            filter: Object.keys(filter).length > 0 ? filter : undefined,
          },
        }),
      );

      // Extraire les valeurs
      const national = nationalStats[0] || {};
      const diaspora = diasporaStats[0] || {};

      // Calculer les totaux
      const nationalVoters = parseInt(national.sum?.voters || '0');
      const diasporaVoters = parseInt(diaspora.sum?.voters || '0');
      const totalVoters = nationalVoters + diasporaVoters;

      const nationalOffices = parseInt(national.count?.office_number || '0');
      const diasporaOffices = parseInt(diaspora.count?.office_number || '0');
      const totalOffices = nationalOffices + diasporaOffices;

      const nationalPlaces = parseInt(national.countDistinct?.polling_place || '0');
      const diasporaPlaces = parseInt(diaspora.countDistinct?.polling_place || '0');
      const totalPlaces = nationalPlaces + diasporaPlaces;

      const nationalDepartments = parseInt(national.countDistinct?.department || '0');
      const diasporaCountries = parseInt(diaspora.countDistinct?.country || '0');
      const totalDepartments = nationalDepartments + diasporaCountries;

      return {
        total: {
          voters: totalVoters,
          offices: totalOffices,
          places: totalPlaces,
          departments: totalDepartments,
        },
        national: {
          voters: nationalVoters,
          offices: nationalOffices,
          places: nationalPlaces,
          departments: nationalDepartments,
          municipalities: parseInt(national.countDistinct?.municipality || '0'),
        },
        diaspora: {
          voters: diasporaVoters,
          offices: diasporaOffices,
          places: diasporaPlaces,
          countries: diasporaCountries,
          localities: parseInt(diaspora.countDistinct?.locality || '0'),
          diplomaticRepresentations: parseInt(
            diaspora.countDistinct?.diplomatic_representation || '0',
          ),
        },
      };
    } catch (error) {
      console.error('Error fetching election map summary:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération du résumé de la carte électorale',
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: 'election-carte-summary',
    getKey: (event) => {
      const query = getQuery(event);
      return `election-carte-summary-${JSON.stringify(query)}`;
    },
  },
);
