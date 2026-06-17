import { readItems } from '@directus/sdk';

/**
 * Map statique : slug de l'entité → slug du vote assemblée ayant abrogé l'institution.
 * Fait historique immuable — ne nécessite pas de champ CMS dédié.
 */
const DISSOLUTION_VOTE_MAP: Record<string, string> = {
  'conseil-economique-social-environnemental': '4',
  'haut-conseil-des-collectivites-territoriales': '4',
};

const TOP_LEVEL_TYPES = new Set(['presidence', 'primature']);

export default defineCachedEventHandler(
  async () => {
    const cmsClient = getCmsClient();

    // Fetch the active decree once for snapshot lookups
    type DecreeRow = { id: string; numero: string; status?: string; date_publication?: string };
    const decrees = await cmsClient.request(
      readItems('state_organization_decree', {
        fields: ['id', 'numero', 'status', 'date_publication'],
        filter: { status: { _neq: 'draft' } },
        sort: ['-date_publication'],
        limit: 20,
      }),
    );
    const activeDecree =
      (decrees as DecreeRow[]).find((d) => d.status === 'active') ||
      (decrees as DecreeRow[])[0] ||
      null;

    // Fetch snapshot code_institution for presidence & primature in one query
    const snapshotCodeBySlug = new Map<string, number>();
    if (activeDecree) {
      type SnapshotRow = { code_institution?: number | null; public_entity?: { slug?: string } };
      const snapshots = await cmsClient.request(
        readItems('state_organization_entity_snapshot', {
          fields: ['code_institution', 'public_entity.slug'],
          filter: {
            decree: { _eq: activeDecree.id },
            public_entity: { entity_type: { code: { _in: ['presidence', 'primature'] } } },
          },
          limit: -1,
        }),
      );
      for (const snap of snapshots as SnapshotRow[]) {
        const entitySlug = snap.public_entity?.slug;
        if (entitySlug && snap.code_institution != null) {
          snapshotCodeBySlug.set(entitySlug, snap.code_institution);
        }
      }
    }

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
          'code_institution',
        ],
        filter: {
          entity_type: {
            code: { _in: ['institution', 'presidence', 'primature'] },
          },
        },
        sort: ['name'],
        limit: -1,
      }),
    );

    type RawEntity = Record<string, unknown> & { entity_type?: Record<string, string> };

    const mapped = (institutions as RawEntity[]).map((item) => {
      const slug = item.slug as string;
      const typeCode = (item.entity_type?.code ?? 'institution') as string;
      const dissolved = slug in DISSOLUTION_VOTE_MAP;

      // For presidence/primature prefer the snapshot-resolved code_institution
      const code_institution = TOP_LEVEL_TYPES.has(typeCode)
        ? (snapshotCodeBySlug.get(slug) ?? ((item.code_institution ?? null) as number | null))
        : ((item.code_institution ?? null) as number | null);

      return {
        id: item.id as string,
        slug,
        name: item.name as string,
        has_public_page: item.has_public_page as boolean,
        type_code: typeCode,
        type_label: (item.entity_type?.label ?? 'Institution') as string,
        description: (item.description ?? null) as string | null,
        logo: (item.logo ?? null) as string | null,
        web_site: (item.web_site ?? null) as string | null,
        adresse: (item.adresse ?? null) as string | null,
        email: (item.email ?? null) as string | null,
        phone: (item.phone ?? null) as string | null,
        code_institution,
        dissolved,
        dissolution_vote_slug: dissolved ? (DISSOLUTION_VOTE_MAP[slug] ?? null) : null,
      };
    });

    // Sort by code_institution ascending (nulls last), then by name
    mapped.sort((a, b) => {
      if (a.code_institution == null && b.code_institution == null)
        return a.name.localeCompare(b.name);
      if (a.code_institution == null) return 1;
      if (b.code_institution == null) return -1;
      return a.code_institution - b.code_institution;
    });

    return { institutions: mapped };
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT, 10),
    name: 'etat-organisation-institutions',
    getKey: () => 'etat-organisation-institutions',
  },
);
