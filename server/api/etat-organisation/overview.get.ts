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
      readItems('state_organization_decree', {
        fields: ['id', 'numero', 'status', 'date_publication'],
        filter: { status: { _neq: 'draft' } },
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

    // Resolve true previousDecree via available entity_change pairs
    const pairsRaw = await cmsClient.request(
      readItems('state_organization_entity_change', {
        fields: ['from_decree.id', 'to_decree.id'],
        limit: -1,
      }),
    )
    const seenPairs = new Set<string>()
    let truePrevId: string | null = null
    for (const row of pairsRaw as any[]) {
      const fromId = row.from_decree?.id ? String(row.from_decree.id) : null
      const toId = row.to_decree?.id ? String(row.to_decree.id) : null
      if (!fromId || !toId) continue
      const key = `${fromId}__${toId}`
      if (!seenPairs.has(key)) {
        seenPairs.add(key)
        if (toId === activeDecree.id) truePrevId = fromId
      }
    }
    const previousDecree = truePrevId
      ? (orderedDecrees.find(d => d.id === truePrevId) ?? orderedDecrees.find(d => d.id !== activeDecree.id) ?? null)
      : (orderedDecrees.find(d => d.id !== activeDecree.id) ?? null)

    const [allTypes, activeSnapshots, allChanges, recentChanges] = await Promise.all([
      cmsClient.request(
        readItems('state_organization_entity_type', {
          fields: ['id', 'code', 'label'],
          sort: ['label'],
          limit: -1,
        }),
      ),
      // Compter à partir du snapshot du décret actif (même logique que la page
      // /etat-senegal/organisation), et non du total brut des entités en base.
      cmsClient.request(
        readItems('state_organization_entity_snapshot', {
          filter: { decree: { _eq: activeDecree.id } },
          fields: [
            'id',
            'public_entity.id',
            'public_entity.has_public_page',
            'public_entity.entity_type.code',
          ],
          limit: -1,
        }),
      ),
      // Full count for summary (lightweight — only id + category)
      previousDecree
        ? cmsClient.request(
            readItems('state_organization_entity_change', {
              fields: ['id', 'change_category'],
              filter: {
                from_decree: { _eq: previousDecree.id },
                to_decree: { _eq: activeDecree.id },
              },
              limit: -1,
            }),
          )
        : Promise.resolve([]),
      // Recent items for display (limit 24)
      previousDecree
        ? cmsClient.request(
            readItems('state_organization_entity_change', {
              fields: [
                'id',
                'change_category',
                'description',
                'entity.id',
                'entity.slug',
                'entity.name',
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
        : Promise.resolve([]),
    ])

    // Déduplication par public_entity (un snapshot par entité dans le décret actif)
    type SnapshotRow = {
      public_entity?: {
        id?: string | number
        has_public_page?: boolean
        entity_type?: { code?: string }
      } | null
    }
    const entityById = new Map<string, { has_public_page: boolean; type_code: string }>()
    for (const snapshot of (activeSnapshots as SnapshotRow[]) || []) {
      const entity = snapshot?.public_entity
      const entityId = entity?.id != null ? String(entity.id) : null
      if (!entityId || entityById.has(entityId)) continue
      entityById.set(entityId, {
        has_public_page: entity?.has_public_page === true,
        type_code: entity?.entity_type?.code || 'other',
      })
    }

    const totalEntities = entityById.size
    const publicPages = Array.from(entityById.values()).filter(e => e.has_public_page).length

    const typeCounts = new Map<string, number>()
    for (const entity of entityById.values()) {
      typeCounts.set(entity.type_code, (typeCounts.get(entity.type_code) || 0) + 1)
    }

    const typeStats = (allTypes as any[])
      .map((type: any) => ({
        code: type.code,
        label: type.label,
        count: typeCounts.get(type.code) || 0,
      }))
      .filter(type => type.count > 0)

    const changeCounts = new Map<string, number>()
    for (const change of allChanges as any[]) {
      const category = change.change_category || 'other'
      changeCounts.set(category, (changeCounts.get(category) || 0) + 1)
    }

    const changeSummary = Array.from(changeCounts.entries()).map(([category, count]) => ({
      category,
      label: CHANGE_LABELS[category] || category,
      count,
    }))

    // ── Parent name lookup for recent changes ─────────────────────
    const entityIds = (recentChanges as any[]).map((c: any) => c.entity?.id).filter(Boolean)
    const parentNameMap = new Map<string, string>()
    const rootNameMap = new Map<string, string>()

    if (entityIds.length > 0) {
      try {
        const snapshotFields = [
          'public_entity',
          'parent_snapshot.official_label',
          'parent_snapshot.parent_snapshot.official_label',
          'parent_snapshot.parent_snapshot.parent_snapshot.official_label',
        ]
        // Two separate _eq queries (like changes.get.ts) — more reliable than _in
        const [toSnapshots, fromSnapshots] = await Promise.all([
          cmsClient.request(
            readItems('state_organization_entity_snapshot', {
              fields: snapshotFields,
              filter: { decree: { _eq: activeDecree.id }, public_entity: { _in: entityIds } },
              limit: -1,
            }),
          ),
          previousDecree
            ? cmsClient.request(
                readItems('state_organization_entity_snapshot', {
                  fields: snapshotFields,
                  filter: { decree: { _eq: previousDecree.id }, public_entity: { _in: entityIds } },
                  limit: -1,
                }),
              )
            : Promise.resolve([]),
        ])
        for (const s of [...(toSnapshots as any[]), ...(fromSnapshots as any[])]) {
          const rawId = typeof s.public_entity === 'object' ? s.public_entity?.id : s.public_entity
          const entityId = rawId != null ? String(rawId) : null
          if (!entityId) continue
          const p1 = (s.parent_snapshot as any)?.official_label ?? null
          const p2 = (s.parent_snapshot as any)?.parent_snapshot?.official_label ?? null
          const p3 = (s.parent_snapshot as any)?.parent_snapshot?.parent_snapshot?.official_label ?? null
          if (!parentNameMap.has(entityId) && p1) parentNameMap.set(entityId, p1)
          // Root: deepest ancestor available (p3 > p2 > p1) — covers shallow and deep hierarchies
          const root = p3 || p2 || p1 || null
          if (!rootNameMap.has(entityId) && root) rootNameMap.set(entityId, root)
        }
      }
      catch {
        // Non-fatal: proceed without parent context
      }
    }

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
        total: (allChanges as any[]).length,
      },
      recent_changes: (recentChanges as any[]).map((change: any) => {
        const entityId = change.entity?.id != null ? String(change.entity.id) : null
        return {
          id: change.id,
          category: change.change_category,
          label: CHANGE_LABELS[change.change_category] || change.change_category,
          description: change.description,
          name: change.entity?.name ?? null,
          slug: change.entity?.slug || null,
          has_public_page: change.entity?.has_public_page === true,
          from_decree: change.from_decree?.numero || null,
          to_decree: change.to_decree?.numero || null,
          parent_name: entityId ? (parentNameMap.get(entityId) ?? null) : null,
          root_name: entityId ? (rootNameMap.get(entityId) ?? null) : null,
        }
      }),
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT),
    name: 'etat-organisation-overview',
  },
)
