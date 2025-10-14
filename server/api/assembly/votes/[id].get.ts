import { readItem } from '@directus/sdk'
import { getCmsClient } from '~/server/utils/cms-client'

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig()
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID du vote parlementaire manquant',
      })
    }

    try {
      // ⚠️ TEMPORAIRE: La table assembly_vote n'existe peut-être pas encore dans le CMS
      console.log('⚠️ API vote detail: Table assembly_vote non disponible')

      throw createError({
        statusCode: 404,
        statusMessage: 'Vote non trouvé (table non disponible)',
      })

      // ✅ Code original - à réactiver quand la table sera créée dans le CMS
      const directus = getCmsClient()

      // Récupération du vote complet avec détails des députés
      const voteData = await directus
        .request(
          readItem('assembly_vote', id, {
            fields: [
              'id',
              'title',
              'description',
              'date',
              'status',
              'vote_type',
              'result',
              'votes_for',
              'votes_against',
              'votes_abstain',
              'law_project',
              'session',
              'deputy_votes.deputy.id',
              'deputy_votes.deputy.first_name',
              'deputy_votes.deputy.last_name',
              'deputy_votes.deputy.photo',
              'deputy_votes.deputy.group.name',
              'deputy_votes.deputy.group.color',
              'deputy_votes.vote',
            ],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message: error.errors?.[0]?.message || 'Vote parlementaire introuvable',
          })
        })

      // Transformation des votes des députés
      const deputyVotes = Array.isArray(voteData.deputy_votes)
        ? voteData.deputy_votes.map((dv: any) => ({
            deputy: dv.deputy
              ? {
                  id: dv.deputy.id,
                  first_name: dv.deputy.first_name,
                  last_name: dv.deputy.last_name,
                  photo: dv.deputy.photo ? `${config.cmsApiUrl}/assets/${dv.deputy.photo}` : null,
                  group: dv.deputy.group || null,
                }
              : null,
            vote: dv.vote, // for, against, abstain
          }))
        : []

      // Transformation des données
      const transformedVote = {
        id: voteData.id,
        title: voteData.title || null,
        description: voteData.description || null,
        date: voteData.date || null,
        status: voteData.status || null,
        vote_type: voteData.vote_type || null,
        result: voteData.result || null,
        votes_for: voteData.votes_for || 0,
        votes_against: voteData.votes_against || 0,
        votes_abstain: voteData.votes_abstain || 0,
        total_votes:
          (voteData.votes_for || 0) + (voteData.votes_against || 0) + (voteData.votes_abstain || 0),
        law_project: voteData.law_project || null,
        session: voteData.session || null,
        deputy_votes: deputyVotes,
      }

      return {
        vote: transformedVote,
      };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vote parlementaire non trouvé',
      })
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'assembly-vote-detail',
    getKey: (event) => `assembly-vote-${getRouterParam(event, 'id')}`,
  },
)
