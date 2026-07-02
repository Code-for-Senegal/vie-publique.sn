// server/api/assembly/deputies/[id]/questions.get.ts
import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "L'ID du député est requis",
      });
    }

    try {
      // Récupération des questions du député
      const questionsData = await directus.request(
        readItems('assembly_question', {
          fields: ['id', 'subject', 'slug', 'question_date'],
          filter: {
            deputy: { id: { _eq: id } },
            status: { _eq: 'published' },
          },
          sort: ['-question_date'],
          limit: 2000,
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
      console.error('Error fetching deputy questions:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des questions',
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: 'assembly-deputy-questions-v2',
    getKey: (event) => `deputy-questions-${getRouterParam(event, 'id')}`,
  },
);
