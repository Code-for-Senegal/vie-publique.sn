import { readItem } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de la question parlementaire manquant',
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération de la question complète
      const questionData = await directus
        .request(
          readItem('assembly_question', id, {
            fields: [
              'id',
              'subject',
              'slug',
              'question_text',
              'question_date',
              'status',
              'deputy.id',
              'deputy.first_name',
              'deputy.last_name',
              'deputy.photo',
              'deputy.group.name',
              'deputy.group.color',
              'attachments.directus_files_id.id',
              'attachments.directus_files_id.type',
              'attachments.directus_files_id.filename_download',
              'attachments.directus_files_id.filesize',
            ],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message: error.errors?.[0]?.message || 'Question parlementaire introuvable',
          });
        });

      // Transformation des données
      const transformedQuestion = {
        id: questionData.id,
        subject: questionData.subject,
        // Slug SEO : celui du CMS s'il existe, sinon généré depuis le sujet (l'id reste la clé).
        slug:
          (questionData as any).slug ||
          generateSlugFromName(questionData.subject || `question-${id}`),
        question_text: questionData.question_text || null,
        question_date: questionData.question_date || null,
        status: questionData.status,
        deputy: questionData.deputy
          ? {
              id: questionData.deputy.id,
              first_name: questionData.deputy.first_name,
              last_name: questionData.deputy.last_name,
              photo: questionData.deputy.photo || null,
              group: questionData.deputy.group || null,
            }
          : null,
        attachments: Array.isArray(questionData.attachments)
          ? questionData.attachments.map((attachment: any) => ({
              id: attachment.directus_files_id?.id,
              type: attachment.directus_files_id?.type,
              filename: attachment.directus_files_id?.filename_download,
              filesize: attachment.directus_files_id?.filesize,
              url: attachment.directus_files_id?.id || null,
            }))
          : [],
      };

      return {
        question: transformedQuestion,
      };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Question parlementaire non trouvée',
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'assembly-question-detail-v2',
    getKey: (event) => `assembly-question-${getRouterParam(event, 'id')}`,
  },
);
