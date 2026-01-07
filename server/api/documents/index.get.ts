import { readItems } from "@directus/sdk";
import type { Document } from "~~/types/document";

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-publish_date";
    const filterType = query.filterType as string;
    const type = query.type as string;
    const electionId = query.election_id as string;

    try {
      const directus = getCmsClient();

      const filter: any = {
        status: {
          _eq: "published",
        },
      };

      if (electionId) {
        filter.election_id = {
          _eq: parseInt(electionId),
        };
      }

      if (type && type !== "all") {
        filter.type = {
          _eq: type,
        };
      }

      if (filterType && filterType !== "" && filterType !== "all") {
        const year = parseInt(filterType);
        if (!isNaN(year)) {
          filter.publish_date = {
            _between: [`${year}-01-01`, `${year}-12-31`],
          };
        } else {
          if (type === "audit_report") {
            filter.audit_institution = {
              _eq: filterType,
            };
          } else {
            filter.type = {
              _eq: filterType,
            };
          }
        }
      }

      const offset = (page - 1) * limit;

      let sortField = sortBy;
      if (sortBy === "-date_created") {
        sortField = "-date_created";
      } else if (sortBy === "date_created") {
        sortField = "date_created";
      }

      const options: any = {
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
          "election_id",
          "file.id",
          "file.type",
          "file.filesize",
          "file.filename_download",
        ],
        filter,
        limit,
        offset,
        sort: [sortField],
      };

      if (search && search.trim() !== "") {
        options.search = search;
      }

      const documentData = await directus
        .request(readItems("documents", options))
        .catch((error: any) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message ||
              error.message ||
              "Erreur interne lors de la récupération des documents",
          });
        });

      const countOptions: any = {
        fields: ["id"],
        filter,
        aggregate: {
          count: ["id"],
        },
      };

      if (search && search.trim() !== "") {
        countOptions.search = search;
      }

      const totalCount = await directus
        .request(readItems("documents", countOptions))
        .then((result: any) => {
          return result?.[0]?.count?.id || result?.[0]?.count || 0;
        })
        .catch(() => 0);

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
          ? { cover_image: doc.cover_image }
          : {}),
        ...(doc.election_id ? { election_id: doc.election_id } : {}),
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
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Une erreur est survenue lors de la récupération des documents",
      });
    }
  },
  {
    maxAge: 60 * 60,
    name: "documents",
    getKey: (event) => {
      const query = getQuery(event);
      return `documents-${JSON.stringify(query)}`;
    },
  },
);
