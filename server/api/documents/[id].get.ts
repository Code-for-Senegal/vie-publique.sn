// server/api/documents/detail/[id].ts
import { readItem } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

interface Document {
  id: string;
  title: string;
  slug: string;
  type: string;
  publish_date: string;
  description?: string;
  audit_institution?: string;
  cover_image?: string;
  content_html?: string;
  file?: {
    id: string;
    type: string;
    filesize: string;
    filename_download: string;
  };
}

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID du document manquant",
      });
    }

    try {
      const directus = getCmsClient();

      const documentData = await directus.request(
        readItem("documents", id, {
          fields: [
            "id",
            "title",
            "slug",
            "status",
            "type",
            "publish_date",
            "description",
            "audit_institution",
            "cover_image",
            "content_html",
            "file.id",
            "file.type",
            "file.filesize",
            "file.filename_download",
          ],
        }),
      );

      // Vérifier si le document est publié
      if (documentData.status !== "published") {
        throw createError({
          statusCode: 404,
          statusMessage: "Document non trouvé",
        });
      }

      // Transformation des données
      const transformedDocument: Document = {
        id: documentData.id,
        title: documentData.title,
        slug: documentData.slug,
        type: documentData.type,
        publish_date: documentData.publish_date,
        ...(documentData.description
          ? { description: documentData.description }
          : {}),
        ...(documentData.audit_institution
          ? { audit_institution: documentData.audit_institution }
          : {}),
        ...(documentData.cover_image
          ? {
              cover_image: `${config.cmsApiUrl}/assets/${documentData.cover_image}`,
            }
          : {}),
        ...(documentData.content_html
          ? { content_html: documentData.content_html }
          : {}),
        ...(documentData.file ? { file: documentData.file } : {}),
      };

      return {
        document: transformedDocument,
      };
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du document ${id}:`, error);

      if (error.statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération du document",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "document-detail",
    getKey: (event) => {
      const id = getRouterParam(event, "id");
      return `document-detail-${id}`;
    },
  },
);
