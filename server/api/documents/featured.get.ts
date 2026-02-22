import { readItems } from '@directus/sdk';
import type { Document } from '~/types/document';

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 3;

    try {
      const directus = getCmsClient();

      // Filtre pour récupérer uniquement les documents featured et publiés
      const filter: any = {
        status: {
          _eq: 'published',
        },
        featured: {
          _eq: true,
        },
      };

      // Récupération des documents featured
      const documentData = await directus
        .request(
          readItems('documents', {
            fields: [
              'id',
              'title',
              'slug',
              'type',
              'publish_date',
              'date_created',
              'cover_image',
              'featured',
            ],
            filter,
            limit,
            sort: ['-publish_date'],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || 'Erreur interne du serveur',
          });
        });

      // Transformation des données
      const transformedDocuments: Document[] = documentData.map((doc) => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        type: doc.type,
        publish_date: doc.publish_date,
        ...(doc.cover_image ? { cover_image: doc.cover_image } : {}),
        featured: doc.featured,
      }));

      return {
        documents: transformedDocuments,
        total: transformedDocuments.length,
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Une erreur est survenue lors de la récupération des documents mis en avant',
      });
    }
  },
  {
    maxAge: 60 * 5, // 5 minutes
    name: 'documents-featured',
    getKey: (event) => {
      const query = getQuery(event);
      return `documents-featured-${JSON.stringify(query)}`;
    },
  },
);
