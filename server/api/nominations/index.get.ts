import { readItems } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";
import type { GovernmentMember } from "~/types/government-member";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 25;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-nominationDate";
    const filterType = query.filterType as string; // Type de nomination
    const filterGender = query.filterGender as string; // Genre

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: "published",
        },
      };

      // Filtre par type de nomination (Ministre, Directeur, PCA...)
      if (filterType && filterType !== "all") {
        filter.type = {
          _eq: filterType,
        };
      }

      // Filtre par genre
      if (filterGender && filterGender !== "all") {
        filter.sexe = {
          _eq: filterGender,
        };
      }

      // Recherche textuelle (nom, rôle, organisation)
      if (search) {
        filter._or = [
          {
            name: {
              _icontains: search,
            },
          },
          {
            role: {
              _icontains: search,
            },
          },
          {
            organisation: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Récupération des nominations avec pagination
      const nominationData = await directus
        .request(
          readItems("positions", {
            fields: [
              "id",
              "name",
              "sexe",
              "type",
              "role",
              "organisation",
              "nominationDate",
              "endDate",
              "photo",
              "formation",
              "predecessor",
              "rating",
            ],
            filter,
            limit,
            offset,
            sort: [sortBy],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Récupération du total de nominations
      const totalCount = await directus
        .request(
          readItems("positions", {
            fields: ["id"],
            filter,
            aggregate: {
              count: ["id"],
            },
          }),
        )
        .then((result: any) => {
          return result?.[0]?.count?.id || 0;
        })
        .catch(() => nominationData.length);

      // Transformation des données
      const transformedNominations: GovernmentMember[] = nominationData.map(
        (nomination) => ({
          id: nomination.id,
          name: nomination.name,
          sexe: nomination.sexe,
          type: nomination.type || null,
          role: nomination.role,
          organisation: nomination.organisation || null,
          nominationDate: nomination.nominationDate,
          endDate: nomination.endDate || "",
          photo: nomination.photo
            ? `${config.cmsApiUrl}/assets/${nomination.photo}`
            : null,
          formation: nomination.formation || null,
          predecessor: nomination.predecessor || null,
          rating: nomination.rating || null,
          portrait: null, // TODO: Ajouter ce champ dans Directus si nécessaire
        }),
      );

      return {
        nominations: transformedNominations,
        totalNominations: Number(totalCount),
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / limit),
        },
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des nominations",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "nominations",
    getKey: (event) => {
      const query = getQuery(event);
      return `nominations-${JSON.stringify(query)}`;
    },
  },
);
