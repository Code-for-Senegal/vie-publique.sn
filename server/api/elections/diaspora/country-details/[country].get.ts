import { readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer les détails des bureaux de vote d'un pays de la diaspora
 * GET /api/elections/diaspora/country-details/:country?search=...&page=1&limit=100
 *
 * @returns Liste des bureaux de vote avec pagination et recherche
 */
export default defineCachedEventHandler(
  async (event) => {
    const country = getRouterParam(event, "country");
    const query = getQuery(event);

    if (!country) {
      throw createError({
        statusCode: 400,
        statusMessage: "Le nom du pays est requis",
      });
    }

    const search = query.search as string | undefined;
    const page = parseInt((query.page as string) || "1");
    const limit = parseInt((query.limit as string) || "1000");

    try {
      const directus = getCmsClient();

      // Construction du filtre
      interface FilterType {
        country: { _eq: string };
        _or?: Array<{
          locality?: { _contains: string };
          polling_place?: { _contains: string };
        }>;
      }

      const filter: FilterType = {
        country: {
          _eq: decodeURIComponent(country),
        },
      };

      // Ajouter le filtre de recherche si présent
      if (search) {
        filter._or = [
          { locality: { _contains: search } },
          { polling_place: { _contains: search } },
        ];
      }

      // Récupération des données avec pagination
      const [locations, totalCount] = await Promise.all([
        directus.request(
          readItems("election_map_diaspora", {
            filter,
            sort: ["locality", "polling_place", "office_number"],
            page,
            limit,
          }),
        ),
        // Récupérer le nombre total pour la pagination
        directus.request(
          readItems("election_map_diaspora", {
            filter,
            aggregate: {
              count: ["id"],
            },
          }),
        ),
      ]);

      interface CountResult {
        count?: {
          id: number;
        };
      }

      const total =
        totalCount && totalCount.length > 0
          ? ((totalCount[0] as CountResult).count?.id || 0)
          : 0;

      return {
        data: locations,
        meta: {
          total_count: total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails du pays ${country}:`,
        error,
      );
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des détails",
      });
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes de cache
    name: "diaspora-country-details",
    getKey: (event) => {
      const country = getRouterParam(event, "country");
      const query = getQuery(event);
      return `diaspora-details-${country}-${JSON.stringify(query)}`;
    },
  },
);
