import { readItems, aggregate } from "@directus/sdk";

interface TopDeputy {
  id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  questionsCount: number;
}

export default defineCachedEventHandler(
  async (event) => {

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 50;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-question_date";
    const filterStatus = query.filterStatus as string;
    const includeStats = query.includeStats === "true";
    const topDeputiesLimit = parseInt(query.topDeputiesLimit as string) || 4;

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

      // Récupération du total de questions avec aggregate()
      const [totalCountResult] = await directus.request(
        aggregate("assembly_question", {
          aggregate: { count: "*" },
          query: { filter },
        })
      );
      const totalCount = Number(totalCountResult?.count || questionData.length);

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
              photo: question.deputy.photo || null,
              group: question.deputy.group || null,
            }
          : null,
      }));

      // Calcul des statistiques des députés les plus actifs (optionnel)
      let topDeputies: TopDeputy[] = [];
      if (includeStats) {
        // Récupérer toutes les questions pour calculer les stats
        const allQuestionsForStats = await directus.request(
          readItems("assembly_question", {
            fields: [
              "deputy.id",
              "deputy.first_name",
              "deputy.last_name",
              "deputy.photo",
            ],
            filter: {
              status: { _eq: "published" },
              deputy: { _nnull: true },
            },
            limit: -1,
          })
        );

        // Agrégation des questions par député
        const deputyStats = new Map<string, TopDeputy>();
        for (const question of allQuestionsForStats) {
          if (!question.deputy?.id) continue;
          const deputyId = question.deputy.id;
          const existing = deputyStats.get(deputyId);
          if (existing) {
            existing.questionsCount++;
          } else {
            deputyStats.set(deputyId, {
              id: deputyId,
              first_name: question.deputy.first_name || "",
              last_name: question.deputy.last_name || "",
              photo: question.deputy.photo || null,
              questionsCount: 1,
            });
          }
        }

        // Trier et limiter
        topDeputies = Array.from(deputyStats.values())
          .sort((a, b) => b.questionsCount - a.questionsCount)
          .slice(0, topDeputiesLimit);
      }

      return {
        questions: transformedQuestions,
        totalQuestions: totalCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        ...(includeStats && { topDeputies }),
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
