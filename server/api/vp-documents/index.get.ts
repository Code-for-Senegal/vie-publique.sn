import { readItems } from '@directus/sdk';
import { VpDocument } from '~/types/vp_document';

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      const documentsData = await directus
        .request(
          readItems('vp_documents', {
            fields: ['id', 'status', 'date_updated', 'title', 'slug', 'file'],
            sort: ['date_updated'], // Tri par date de mise à jour, ou 'id' si préféré
            filter: {
              status: {
                _eq: 'published',
              },
            },
          }),
        )
        .catch((error) => {
          console.error('Directus Error Details:', JSON.stringify(error, null, 2));
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message || 'Erreur interne du serveur lors de la connexion CMS',
          });
        });

      // Transformation des données (si nécessaire, ici c'est direct)
      const transformedDocuments: VpDocument[] = documentsData.map((doc) => ({
        id: doc.id,
        status: doc.status,
        date_updated: doc.date_updated,
        title: doc.title,
        slug: doc.slug,
        file: doc.file,
      }));

      return {
        data: transformedDocuments,
        total: transformedDocuments.length,
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message || 'Une erreur est survenue lors de la récupération des documents',
      });
    }
  },
  {
    maxAge: 60 * 15, // 15 minutes de cache
    name: 'vp-documents',
    getKey: () => 'vp-documents-list',
  },
);
