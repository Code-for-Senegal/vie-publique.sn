import { readItems } from '@directus/sdk';
import type { PublicPerson } from '~/types/public-person';

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 25;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || '-current_appointment.appointment_date';
    const filterCategory = query.filterCategory as string;
    const filterGender = query.filterGender as string;

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: { _eq: 'published' },
      };

      // Filtre par genre
      if (filterGender && filterGender !== 'all') {
        filter.sexe = { _eq: filterGender };
      }

      // Filtre par catégorie de poste (via la nomination actuelle)
      if (filterCategory && filterCategory !== 'all') {
        filter.current_appointment = {
          position_category_slug: { _eq: filterCategory },
        };
      }

      // Recherche textuelle
      if (search) {
        filter._or = [
          { full_name: { _icontains: search } },
          {
            current_appointment: {
              position_title: { _icontains: search },
            },
          },
          {
            current_appointment: {
              organization_label: { _icontains: search },
            },
          },
        ];
      }

      const offset = (page - 1) * limit;

      // Récupération des personnalités avec leur nomination actuelle
      const personsData = await directus
        .request(
          readItems('public_persons', {
            fields: [
              'id',
              'full_name',
              'slug',
              'sexe',
              'photo',
              'current_appointment.id',
              'current_appointment.position_title',
              'current_appointment.position_category',
              'current_appointment.position_category_slug',
              'current_appointment.organization_label',
              'current_appointment.appointment_date',
              'current_appointment.end_date',
              'current_appointment.is_current',
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
            message: error.errors?.[0]?.message || 'Erreur interne du serveur',
          });
        });

      // Récupération du total
      const totalCount = await directus
        .request(
          readItems('public_persons', {
            fields: ['id'],
            filter,
            aggregate: { count: ['id'] },
          }),
        )
        .then((result: any) => result?.[0]?.count?.id || 0)
        .catch(() => personsData.length);

      // Transformation des données
      const persons: PublicPerson[] = personsData.map((person: any) => ({
        id: person.id,
        full_name: person.full_name,
        slug: person.slug || generateSlugFromName(person.full_name),
        sexe: person.sexe,
        photo: person.photo || null,
        current_appointment: person.current_appointment
          ? {
              id: person.current_appointment.id,
              position_title: person.current_appointment.position_title,
              position_category: person.current_appointment.position_category,
              position_category_slug: person.current_appointment.position_category_slug || null,
              organization_label: person.current_appointment.organization_label,
              appointment_date: person.current_appointment.appointment_date,
              end_date: person.current_appointment.end_date || null,
              is_current: person.current_appointment.is_current,
            }
          : null,
      }));

      return {
        persons,
        total: Number(totalCount),
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
        statusMessage: 'Une erreur est survenue lors de la récupération des personnalités',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 min en prod (à augmenter après stabilisation)
    name: 'public-persons',
    getKey: (event) => buildCacheKey('public-persons', getQuery(event)),
  },
);
