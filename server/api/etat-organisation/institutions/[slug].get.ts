import { readItems } from '@directus/sdk';

const DISSOLUTION_VOTE_MAP: Record<string, string> = {
  'conseil-economique-social-environnemental': '4',
  'haut-conseil-des-collectivites-territoriales': '4',
};

const TOP_LEVEL_TYPES = new Set(['presidence', 'primature']);

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
          'body',
          'cover_image',
          'faq',
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
          entity_type: { code: { _in: ['institution', 'primature', 'presidence'] } },
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
    const typeCode = (item.entity_type?.code ?? 'institution') as string;
    const dissolved = itemSlug in DISSOLUTION_VOTE_MAP;

    // For presidence and primature, resolve code_institution from the active snapshot
    let codeInstitution = (item.code_institution ?? null) as number | null;

    if (TOP_LEVEL_TYPES.has(typeCode)) {
      type DecreeRow = { id: string; numero: string; status?: string; date_publication?: string };

      const decrees = await cmsClient.request(
        readItems('state_organization_decree', {
          fields: ['id', 'numero', 'status', 'date_publication'],
          filter: { status: { _neq: 'draft' } },
          sort: ['-date_publication'],
          limit: 20,
        }),
      );

      if (Array.isArray(decrees) && decrees.length > 0) {
        const activeDecree =
          (decrees as DecreeRow[]).find((d) => d.status === 'active') ||
          (decrees as DecreeRow[])[0];

        const snapshots = await cmsClient.request(
          readItems('state_organization_entity_snapshot', {
            fields: ['code_institution'],
            filter: {
              decree: { _eq: activeDecree.id },
              public_entity: { slug: { _eq: itemSlug } },
            },
            limit: 1,
          }),
        );

        type SnapshotRow = { code_institution?: number | null };
        const snap = (snapshots as SnapshotRow[])[0];
        if (snap?.code_institution != null) {
          codeInstitution = snap.code_institution;
        }
      }
    }

    return {
      institution: {
        id: item.id as string,
        slug: itemSlug,
        name: item.name as string,
        has_public_page: item.has_public_page as boolean,
        type_code: typeCode,
        type_label: (item.entity_type?.label ?? 'Institution') as string,
        description: (item.description ?? null) as string | null,
        body: (item.body ?? null) as string | null,
        cover_image: (item.cover_image ?? null) as string | null,
        faq: (Array.isArray(item.faq) ? item.faq : null) as
          | { question: string; answer: string }[]
          | null,
        logo: (item.logo ?? null) as string | null,
        web_site: (item.web_site ?? null) as string | null,
        adresse: (item.adresse ?? null) as string | null,
        email: (item.email ?? null) as string | null,
        phone: (item.phone ?? null) as string | null,
        reseaux_sociaux: (item.reseaux_sociaux ?? null) as Record<string, string> | null,
        code_institution: codeInstitution,
        dissolved,
        dissolution_vote_slug: dissolved ? (DISSOLUTION_VOTE_MAP[itemSlug] ?? null) : null,
      },
    };
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT),
    name: 'etat-organisation-institution-detail-v2',
    getKey: (event) => `etat-organisation-institution-${getRouterParam(event, 'slug')}`,
  },
);
