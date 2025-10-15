import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 50;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-question_date";
    const filterStatus = query.filterStatus as string;

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: filterStatus || "published",
        },
      };

      // Recherche textuelle (sujet de la question)
      if (search) {
        filter._or = [
          {
            subject: {
              _icontains: search,
            },
          },
          {
            question_text: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Récupération des questions avec pagination
      const questionData = await directus
        .request(
          readItems("assembly_question", {
            fields: [
              "id",
              "subject",
              "question_date",
              "status",
              "deputy.id",
              "deputy.first_name",
              "deputy.last_name",
              "deputy.photo",
              "deputy.group.name",
              "deputy.group.color",
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

      // Récupération du total de questions
      const totalCount = await directus
        .request(
          readItems("assembly_question", {
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
        .catch(() => questionData.length);

      // Transformation des données
      const transformedQuestions = questionData.map((question) => ({
        id: question.id,
        subject: question.subject,
        question_date: question.question_date || null,
        status: question.status,
        deputy: question.deputy
          ? {
              id: question.deputy.id,
              first_name: question.deputy.first_name,
              last_name: question.deputy.last_name,
              photo: question.deputy.photo
                ? `${config.cmsApiUrl}/assets/${question.deputy.photo}`
                : null,
              group: question.deputy.group || null,
            }
          : null,
      }));

      return {
        questions: transformedQuestions,
        totalQuestions: Number(totalCount),
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
          "Une erreur est survenue lors de la récupération des questions parlementaires",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "assembly-questions",
    getKey: (event) => {
      const query = getQuery(event);
      return `assembly-questions-${JSON.stringify(query)}`;
    },
  },
);
