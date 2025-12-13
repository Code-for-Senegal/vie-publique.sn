import { readItems } from '@directus/sdk';
import type { GovernmentMember } from '~/types/government-member';

/**
 * API pour récupérer le gouvernement actuel du Sénégal
 * Filtre les nominations de type "Ministre", "Premier Ministre" et "Secrétaire d'État"
 * qui sont encore en fonction (pas de endDate ou endDate > aujourd'hui)
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    try {
      const directus = getCmsClient();
      const today = new Date().toISOString().split('T')[0];

      // Filtre pour récupérer uniquement le gouvernement actuel
      const filter: any = {
        status: {
          _eq: 'published',
        },
        type: {
          _in: ['Ministre', 'Premier Ministre', "Secrétaire d'État"],
        },
        _and: [
          {
            _or: [
              {
                endDate: {
                  _null: true, // Pas de date de fin = toujours en fonction
                },
              },
              {
                endDate: {
                  _gte: today, // Date de fin dans le futur
                },
              },
            ],
          },
        ],
      };

      // Récupération des membres du gouvernement
      const governmentData = await directus
        .request(
          readItems('positions', {
            fields: [
              'id',
              'name',
              'slug',
              'sexe',
              'type',
              'role',
              'organisation',
              'nominationDate',
              'endDate',
              'photo',
              'formation',
              'predecessor',
              'rating',
            ],
            filter,
            sort: [
              // Premier Ministre en premier, puis Ministres par ordre alphabétique
              'type',
              'name',
            ],
          }),
        )
        .catch((error) => {
          console.error('Erreur Directus gouvernement:', error);
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || 'Erreur interne du serveur',
          });
        });

      // Transformation des données avec génération du slug si nécessaire
      const transformedGovernment: GovernmentMember[] = governmentData.map((member) => ({
        id: member.id,
        name: member.name,
        slug: member.slug || generateSlugFromName(member.name),
        sexe: member.sexe,
        type: member.type || null,
        role: member.role,
        organisation: member.organisation || null,
        nominationDate: member.nominationDate,
        endDate: member.endDate || '',
        photo: member.photo || null,
        formation: member.formation || null,
        predecessor: member.predecessor || null,
        rating: member.rating || null,
        portrait: null,
      }));

      // Regrouper par type
      const primeMinister = transformedGovernment.filter((m) => m.type === 'Premier Ministre');
      const ministers = transformedGovernment.filter((m) => m.type === 'Ministre');
      const secretariesOfState = transformedGovernment.filter(
        (m) => m.type === "Secrétaire d'État",
      );

      return {
        government: {
          primeMinister: primeMinister[0] || null,
          ministers: ministers,
          secretariesOfState: secretariesOfState,
        },
        stats: {
          total: transformedGovernment.length,
          ministers: ministers.length,
          secretariesOfState: secretariesOfState.length,
          women: transformedGovernment.filter((m) => m.sexe === 'Madame').length,
          men: transformedGovernment.filter((m) => m.sexe === 'Monsieur').length,
        },
        lastUpdate: today,
      };
    } catch (error) {
      console.error('Erreur API gouvernement:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Une erreur est survenue lors de la récupération du gouvernement',
      });
    }
  },
  {
    maxAge: 60 * 60 * 6, // 6 heures (le gouvernement change rarement)
    name: 'government-current',
  },
);
