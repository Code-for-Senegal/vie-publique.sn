import { readItems } from '@directus/sdk'
import { CacheDuration, getCacheMaxAge } from '../../utils/cache'

type DecreeRow = {
  id: string
  numero: string
  status?: string
  date_publication?: string
}

const CHANGE_LABELS: Record<string, string> = {
  created: 'Créations',
  rename: 'Renommages',
  reparent: 'Changements de tutelle',
  merge: 'Fusions',
  split: 'Scissions',
  deleted: 'Suppressions',
}

export default defineCachedEventHandler(
  async () => {
    const cmsClient = getCmsClient()

    const decrees = await cmsClient.request(
      readItems('decree', {
        fields: ['id', 'numero', 'status', 'date_publication'],
        sort: ['-date_publication'],
        limit: 20,
      }),
    )

    if (!Array.isArray(decrees) || decrees.length === 0) {
      return {
        decree: null,
        stats: {
          total_entities: 0,
          public_pages: 0,
          types: [],
        },
        recent_changes: [],
      }
    }

    const orderedDecrees = decrees as DecreeRow[]
    const activeDecree = orderedDecrees.find(decree => decree.status === 'active') || orderedDecrees[0]
    const previousDecree = orderedDecrees.find(decree => decree.id !== activeDecree.id)

    const [allTypes, publicEntities, changes] = await Promise.all([
      cmsClient.request(
        readItems('entities_types', {
          fields: ['id', 'code', 'label'],
          sort: ['label'],
          limit: -1,
        }),
      ),
      cmsClient.request(
        readItems('public_entities', {
          fields: ['id', 'has_public_page', 'entity_type.code'],
          limit: -1,
        }),
      ),
      previousDecree
        ? cmsClient.request(
            readItems('entity_changes', {
              fields: [
                'id',
                'change_category',
                'description',
                'entity.slug',
                'entity.has_public_page',
                'from_decree.numero',
                'to_decree.numero',
                'date_created',
              ],
              filter: {
                from_decree: { _eq: previousDecree.id },
                to_decree: { _eq: activeDecree.id },
              },
              sort: ['-date_created'],
              limit: 24,
            }),
          )
        : [],
    ])

    const totalEntities = Array.isArray(publicEntities) ? publicEntities.length : 0
    const publicPages = Array.isArray(publicEntities)
      ? publicEntities.filter((entity: any) => entity.has_public_page === true).length
      : 0

    const typeCounts = new Map<string, number>()
    for (const entity of publicEntities as any[]) {
      const code = entity?.entity_type?.code || 'other'
      typeCounts.set(code, (typeCounts.get(code) || 0) + 1)
    }

    const typeStats = (allTypes as any[])
      .map((type: any) => ({
        code: type.code,
        label: type.label,
        count: typeCounts.get(type.code) || 0,
      }))
      .filter(type => type.count > 0)

    const changeCounts = new Map<string, number>()
    for (const change of changes as any[]) {
      const category = change.change_category || 'other'
      changeCounts.set(category, (changeCounts.get(category) || 0) + 1)
    }

    const changeSummary = Array.from(changeCounts.entries()).map(([category, count]) => ({
      category,
      label: CHANGE_LABELS[category] || category,
      count,
    }))

    return {
      decree: {
        id: activeDecree.id,
        numero: activeDecree.numero,
        date_publication: activeDecree.date_publication,
        status: activeDecree.status,
        previous_numero: previousDecree?.numero || null,
      },
      stats: {
        total_entities: totalEntities,
        public_pages: publicPages,
        types: typeStats,
      },
      changes: {
        summary: changeSummary,
      },
      recent_changes: (changes as any[]).map((change: any) => ({
        id: change.id,
        category: change.change_category,
        label: CHANGE_LABELS[change.change_category] || change.change_category,
        description: change.description,
        slug: change.entity?.slug || null,
        has_public_page: change.entity?.has_public_page === true,
        from_decree: change.from_decree?.numero || null,
        to_decree: change.to_decree?.numero || null,
      })),
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.MEDIUM),
    name: 'etat-organisation-overview',
  },
)
