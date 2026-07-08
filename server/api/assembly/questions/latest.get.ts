// server/api/assembly/questions/latest.get.ts
import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 3;

    try {
      // Récupération des dernières questions publiées
      const questionsData = await directus.request(
        readItems('assembly_question', {
          fields: ['id', 'subject', 'slug', 'question_date', 'date_created'],
          filter: {
            status: { _eq: 'published' },
          },
          sort: ['-date_created'],
          limit,
        }),
      );

      // Slug SEO : celui du CMS s'il existe, sinon généré depuis le sujet.
      const questions = questionsData.map((q: any) => ({
        ...q,
        slug: q.slug || generateSlugFromName(q.subject || `question-${q.id}`),
      }));

      return {
        questions,
      };
    } catch (error) {
      console.error('Error fetching latest questions:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des dernières questions',
      });
    }
  },
  {
    maxAge: 60 * 5, // Cache de 5 minutes
    name: 'assembly-latest-questions-v2',
  },
);
