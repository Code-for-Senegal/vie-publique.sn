import { readItems } from '@directus/sdk';

/**
 * Map statique : slug de l'entité → slug du vote assemblée ayant abrogé l'institution.
 * Fait historique immuable — ne nécessite pas de champ CMS dédié.
 */
const DISSOLUTION_VOTE_MAP: Record<string, string> = {
  'conseil-economique-social-environnemental': '4',
  'haut-conseil-des-collectivites-territoriales': '4',
};

export default defineCachedEventHandler(
  async () => {
    const cmsClient = getCmsClient();

    const institutions = await cmsClient.request(
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
        ],
        filter: {
          entity_type: {
            code: { _eq: 'institution' },
          },
        },
        sort: ['name'],
        limit: -1,
      }),
    );

    type RawEntity = Record<string, unknown> & { entity_type?: Record<string, string> };

    return {
      institutions: (institutions as RawEntity[]).map((item) => {
        const slug = item.slug as string;
        const dissolved = slug in DISSOLUTION_VOTE_MAP;
        return {
          id: item.id as string,
          slug,
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
          dissolved,
          dissolution_vote_slug: dissolved ? (DISSOLUTION_VOTE_MAP[slug] ?? null) : null,
        };
      }),
    };
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT, 10),
    name: 'etat-organisation-institutions',
    getKey: () => 'etat-organisation-institutions',
  },
);
