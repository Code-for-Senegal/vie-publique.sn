import { readItems } from "@directus/sdk";
import { getDirectusClient } from "~/server/utils/directus";
import type { Document } from "~/types/document";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-publish_date";
    const filterType = query.filterType as string;
    const type = query.type as string;

    try {
      const directus = getDirectusClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: "published",
        },
      };

      // Filtre par type (prioritaire)
      if (type && type !== "all") {
        filter.type = {
          _eq: type,
        };
      }

      // Filtre par année
      if (filterType && filterType !== "" && filterType !== "all") {
        const year = parseInt(filterType);
        if (!isNaN(year)) {
          filter.publish_date = {
            _between: [`${year}-01-01`, `${year}-12-31`],
          };
        } else {
          // Si ce n'est pas une année, c'est un type OU un audit_institution
          // Pour les rapports d'audit, on filtre par audit_institution
          if (type === "audit_report") {
            filter.audit_institution = {
              _eq: filterType,
            };
          } else {
            // Pour les autres types, on filtre par type
            filter.type = {
              _eq: filterType,
            };
          }
        }
      }

      // Recherche textuelle
      if (search) {
        filter._or = [
          {
            title: {
              _icontains: search,
            },
          },
          {
            description: {
              _icontains: search,
            },
          },
          {
            audit_institution: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Gérer le tri (support de date_created) pour la recuperation des 3 derniers documents
      let sortField = sortBy;
      if (sortBy === "-date_created") {
        sortField = "-date_created";
      } else if (sortBy === "date_created") {
        sortField = "date_created";
      }

      // Récupération des documents avec pagination et meta
      const documentData = await directus
        .request(
          readItems("documents", {
            fields: [
              "id",
              "title",
              "slug",
              "type",
              "publish_date",
              "date_created",
              "description",
              "audit_institution",
              "cover_image",
              "file.id",
              "file.type",
              "file.filesize",
              "file.filename_download",
            ],
            filter,
            limit,
            offset,
            sort: [sortField],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Recuperation du total de documents
      const totalCount = await directus
        .request(
          readItems("documents", {
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
        .catch(() => documentData.length);

      // Transformation des données
      const transformedDocuments: Document[] = documentData.map((doc) => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        type: doc.type,
        publish_date: doc.publish_date,
        ...(doc.description ? { description: doc.description } : {}),
        ...(doc.audit_institution
          ? { audit_institution: doc.audit_institution }
          : {}),
        ...(doc.cover_image
          ? { cover_image: `${config.cmsApiUrl}/assets/${doc.cover_image}` }
          : {}),
        ...(doc.file ? { file: doc.file } : {}),
      }));

      return {
        documents: transformedDocuments,
        totalDocuments: Number(totalCount),
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
          "Une erreur est survenue lors de la récupération des documents",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "documents",
    getKey: (event) => {
      const query = getQuery(event);
      return `documents-${JSON.stringify(query)}`;
    },
  },
);
