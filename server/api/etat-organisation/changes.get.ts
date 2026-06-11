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

const PAGE_SIZE = 30

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event)
    // Params use decree numero (e.g. "2024-940"), NOT UUIDs
    const fromNumero = (query.from as string) || null
    const toNumero = (query.to as string) || null
    const category = (query.category as string) || null
    const page = Math.max(1, parseInt((query.page as string) || '1', 10) || 1)

    const cmsClient = getCmsClient()

    const decrees = await cmsClient.request(
      readItems('state_organization_decree', {
        fields: ['id', 'numero', 'status', 'date_publication'],
        sort: ['-date_publication'],
        limit: 20,
      }),
    )

    const allDecreeRows = Array.isArray(decrees) ? (decrees as DecreeRow[]) : []

    const allDecrees = allDecreeRows.map(d => ({
      id: d.id,
      numero: d.numero,
      date_publication: d.date_publication,
      status: d.status,
    }))

    if (allDecreeRows.length === 0) {
      return { from_decree: null, to_decree: null, allDecrees, summary: [], changes: [], total: 0, page: 1, pageSize: PAGE_SIZE }
    }

    const activeDecree = allDecreeRows.find(d => d.status === 'active') ?? allDecreeRows[0]
    // "previous" = the decree immediately before the active one
    const previousDecree = allDecreeRows.find(d => d.id !== activeDecree.id) ?? null

    const resolvedTo = toNumero
      ? (allDecreeRows.find(d => d.numero === toNumero) ?? activeDecree)
      : activeDecree

    const resolvedFrom = fromNumero
      ? (allDecreeRows.find(d => d.numero === fromNumero) ?? previousDecree)
      : previousDecree

    if (!resolvedFrom) {
      return {
        from_decree: null,
        to_decree: { id: resolvedTo.id, numero: resolvedTo.numero, date_publication: resolvedTo.date_publication, status: resolvedTo.status },
        allDecrees,
        summary: [],
        changes: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
      }
    }

    // ── Fetch all changes for summary counts ────────────────────────
    const baseFilter = {
      from_decree: { _eq: resolvedFrom.id },
      to_decree: { _eq: resolvedTo.id },
    }

    const allChanges = await cmsClient.request(
      readItems('state_organization_entity_change', {
        fields: ['id', 'change_category'],
        filter: baseFilter,
        limit: -1,
      }),
    )

    // Summary from full set (unfiltered by category)
    const countMap = new Map<string, number>()
    for (const c of allChanges as any[]) {
      const cat = c.change_category || 'other'
      countMap.set(cat, (countMap.get(cat) || 0) + 1)
    }
    const summary = Array.from(countMap.entries()).map(([cat, count]) => ({
      category: cat,
      label: CHANGE_LABELS[cat] || cat,
      count,
    }))

    // ── Paginated fetch (with optional category filter) ─────────────
    const pagedFilter: Record<string, unknown> = { ...baseFilter }
    if (category) pagedFilter.change_category = { _eq: category }

    const filteredChanges = await cmsClient.request(
      readItems('state_organization_entity_change', {
        fields: [
          'id',
          'change_category',
          'description',
          'old_value',
          'new_value',
          'date_created',
          'entity.id',
          'entity.slug',
          'entity.name',
          'entity.has_public_page',
          'from_decree.numero',
          'to_decree.numero',
        ],
        filter: pagedFilter,
        sort: ['change_category', 'description'],
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    )

    // ── Parent name lookup via entity_snapshots ──────────────────────
    // For created/deleted, new_value doesn't carry the parent label — fetch it from snapshots.
    const entityIds = (filteredChanges as any[])
      .map((c: any) => c.entity?.id)
      .filter(Boolean)

    const parentNameMap = new Map<string, string>()
    const rootNameMap = new Map<string, string>()

    if (entityIds.length > 0) {
      try {
        // Fields: direct parent + grandparent (to surface ministère/présidence/primature level)
        const snapshotFields = [
          'public_entity',
          'parent_snapshot.official_label',
          'parent_snapshot.parent_snapshot.official_label',
          'parent_snapshot.parent_snapshot.parent_snapshot.official_label',
        ]
        // Query snapshots for `to_decree` (covers created) and `from_decree` (covers deleted)
        const [toSnapshots, fromSnapshots] = await Promise.all([
          cmsClient.request(
            readItems('state_organization_entity_snapshot', {
              fields: snapshotFields,
              filter: {
                decree: { _eq: resolvedTo.id },
                public_entity: { _in: entityIds },
              },
              limit: -1,
            }),
          ),
          cmsClient.request(
            readItems('state_organization_entity_snapshot', {
              fields: snapshotFields,
              filter: {
                decree: { _eq: resolvedFrom.id },
                public_entity: { _in: entityIds },
              },
              limit: -1,
            }),
          ),
        ])

        for (const s of [...(toSnapshots as any[]), ...(fromSnapshots as any[])]) {
          const rawId = typeof s.public_entity === 'object' ? s.public_entity?.id : s.public_entity
          const entityId = rawId != null ? String(rawId) : null
          if (!entityId) continue

          const p1 = (s.parent_snapshot as any)?.official_label ?? null
          const p2 = (s.parent_snapshot as any)?.parent_snapshot?.official_label ?? null
          const p3 = (s.parent_snapshot as any)?.parent_snapshot?.parent_snapshot?.official_label ?? null

          // Direct parent (first non-null)
          if (!parentNameMap.has(entityId) && p1) parentNameMap.set(entityId, p1)

          // Root: deepest ancestor available (p3 > p2 > p1) — covers shallow and deep hierarchies
          const root = p3 || p2 || p1 || null
          if (!rootNameMap.has(entityId) && root) rootNameMap.set(entityId, root)
        }
      }
      catch {
        // Non-fatal: proceed without parent context if permission denied
      }
    }

    const total = category
      ? (allChanges as any[]).filter((c: any) => c.change_category === category).length
      : (allChanges as any[]).length

    return {
      from_decree: { id: resolvedFrom.id, numero: resolvedFrom.numero, date_publication: resolvedFrom.date_publication, status: resolvedFrom.status },
      to_decree: { id: resolvedTo.id, numero: resolvedTo.numero, date_publication: resolvedTo.date_publication, status: resolvedTo.status },
      allDecrees,
      summary,
      changes: (filteredChanges as any[]).map((c: any) => {
        const entityId = c.entity?.id != null ? String(c.entity.id) : null
        // For reparent: parent_official_label is in new_value/old_value
        // For created/deleted: use snapshot-based lookup
        const parentName: string | null =
          c.change_category === 'reparent'
            ? ((c.new_value as any)?.parent_official_label ?? (c.old_value as any)?.parent_official_label ?? null)
            : c.change_category === 'deleted'
              ? ((c.old_value as any)?.parent_official_label ?? (entityId ? parentNameMap.get(entityId) : null) ?? null)
              : (entityId ? parentNameMap.get(entityId) : null) ?? null

        const rootName: string | null =
          c.change_category === 'reparent'
            ? null // reparent already surfaces the parent directly
            : (entityId ? rootNameMap.get(entityId) : null) ?? null

        return {
          id: c.id,
          category: c.change_category,
          label: CHANGE_LABELS[c.change_category] || c.change_category,
          description: c.description,
          old_value: c.old_value ?? null,
          new_value: c.new_value ?? null,
          slug: c.entity?.slug ?? null,
          has_public_page: c.entity?.has_public_page === true,
          name: c.entity?.name ?? null,
          parent_name: parentName,
          root_name: rootName,
          from_decree: c.from_decree?.numero ?? null,
          to_decree: c.to_decree?.numero ?? null,
          date_created: c.date_created,
        }
      }),
      total,
      page,
      pageSize: PAGE_SIZE,
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.MEDIUM),
    name: 'etat-organisation-changes',
    getKey: (event) => {
      const q = getQuery(event)
      const from = (q.from as string) || 'prev'
      const to = (q.to as string) || 'active'
      const cat = (q.category as string) || 'all'
      const p = (q.page as string) || '1'
      return `${from}-${to}-${cat}-p${p}`
    },
  },
)
