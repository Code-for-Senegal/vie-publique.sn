import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import type { Document } from "~/types/document";
import type { DirectusDocument } from "~/server/utils/directus-types";

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
      const directus = createDirectus<{ documents: DirectusDocument }>(
        config.cmsApiUrl,
      )
        .with(rest())
        .with(staticToken(config.cmsApiKey));

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: "published",
        },
      };

      // Filtre par type depuis les query params
      if (type && type !== "all") {
        filter.type = {
          _eq: type,
        };
      }

      if (filterType && filterType !== "" && filterType !== "all") {
        filter.type = {
          _eq: filterType,
        };
      } else if (type && type !== "" && type !== "all") {
        filter.type = {
          _eq: type,
        };
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
            sort: [sortBy],
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
