import { readItems } from '@directus/sdk';

const DISSOLUTION_VOTE_MAP: Record<string, string> = {
  'conseil-economique-social-environnemental': '4',
  'haut-conseil-des-collectivites-territoriales': '4',
};

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug');
    if (!slug) {
      throw createError({ statusCode: 400, message: 'Le slug est requis' });
    }

    const cmsClient = getCmsClient();

    const results = await cmsClient.request(
      readItems('state_organization_entity', {
        fields: [
          'id',
          'slug',
          'name',
          'has_public_page',
          'entity_type.code',
          'entity_type.label',
          'description',
          'logo',
          'web_site',
          'adresse',
          'email',
          'phone',
          'reseaux_sociaux',
          'code_institution',
        ],
        filter: {
          slug: { _eq: slug },
          entity_type: { code: { _eq: 'institution' } },
        },
        limit: 1,
      }),
    );

    type RawInstitution = Record<string, unknown> & { entity_type?: Record<string, string> };
    const item = (results as RawInstitution[])[0];

    if (!item) {
      throw createError({ statusCode: 404, message: 'Institution non trouvée' });
    }

    const itemSlug = item.slug as string;
    const dissolved = itemSlug in DISSOLUTION_VOTE_MAP;

    return {
      institution: {
        id: item.id as string,
        slug: itemSlug,
        name: item.name as string,
        has_public_page: item.has_public_page as boolean,
        type_code: (item.entity_type?.code ?? 'institution') as string,
        type_label: (item.entity_type?.label ?? 'Institution') as string,
        description: (item.description ?? null) as string | null,
        logo: (item.logo ?? null) as string | null,
        web_site: (item.web_site ?? null) as string | null,
        adresse: (item.adresse ?? null) as string | null,
        email: (item.email ?? null) as string | null,
        phone: (item.phone ?? null) as string | null,
        reseaux_sociaux: (item.reseaux_sociaux ?? null) as Record<string, string> | null,
        code_institution: (item.code_institution ?? null) as number | null,
        dissolved,
        dissolution_vote_slug: dissolved ? (DISSOLUTION_VOTE_MAP[itemSlug] ?? null) : null,
      },
    };
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT),
    name: 'etat-organisation-institution-detail',
    getKey: (event) => `etat-organisation-institution-${getRouterParam(event, 'slug')}`,
  },
);
