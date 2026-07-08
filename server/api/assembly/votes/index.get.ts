import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 50;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || '-date';
    const filterStatus = query.filterStatus as string;

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {};

      // Filtre par statut si fourni
      if (filterStatus && filterStatus !== 'all') {
        filter.status = {
          _eq: filterStatus,
        };
      }

      // Recherche textuelle (titre ou description du vote)
      if (search) {
        filter._or = [
          {
            name: {
              _icontains: search,
            },
          },
          {
            description: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Récupération des votes avec pagination depuis la collection assembly_votes
      const voteData = await directus.request(
        readItems('assembly_vote', {
          fields: [
            'id',
            'name',
            'slug',
            'desc',
            'description',
            'date',
            'status',
            'type',
            'voters',
            'voters_for',
            'voters_against',
            'voters_abstention',
            'number',
          ],
          filter,
          limit,
          offset,
          sort: [sortBy],
        }),
      );

      // Slug SEO : celui du CMS s'il existe, sinon généré depuis le nom (l'id reste la clé).
      const votes = (voteData as any[]).map((v) => ({
        ...v,
        slug: v.slug || generateSlugFromName(v.name || `vote-${v.id}`),
      }));

      // Récupération du total de votes
      const [totalCountResult] = await directus
        .request(
          readItems('assembly_vote', {
            fields: ['id'],
            filter,
            aggregate: {
              count: ['id'],
            },
          }),
        )
        .catch(() => [{ count: { id: voteData.length } }]);

      const totalCount = Number(totalCountResult?.count?.id || voteData.length);

      return {
        votes,
        totalVotes: totalCount,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error: any) {
      console.error('Error fetching assembly votes:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        stack: error.stack,
      });
      throw createError({
        statusCode: 500,
        statusMessage: `Une erreur est survenue lors de la récupération des votes parlementaires: ${error.message || 'Unknown error'}`,
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'assembly-votes-v2',
    getKey: (event) => buildCacheKey('assembly-votes', getQuery(event)),
  },
);
