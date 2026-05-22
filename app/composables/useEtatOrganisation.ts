import type {
  EtatOrganisationEntitiesResponse,
  EtatOrganisationOverview,
  EtatOrganisationTreeNode,
} from '~~/types/etat-organisation'

const LIST_PAGE_SIZE = 25

export function useEtatOrganisation() {
  const route = useRoute()
  const router = useRouter()

  // ── Filter state stored in URL query params ─────────────────────
  const searchTerm = computed({
    get: () => (route.query.search as string) || '',
    set: (v: string) =>
      router.push({
        query: { ...route.query, search: v || undefined, page: undefined },
      }),
  })

  const selectedType = computed({
    get: () => (route.query.type as string) || '',
    set: (v: string) =>
      router.push({
        query: { ...route.query, type: v || undefined, page: undefined },
      }),
  })

  const listPage = computed({
    get: () => Math.max(1, parseInt((route.query.page as string) || '1', 10) || 1),
    set: (v: number) =>
      router.push({
        query: { ...route.query, page: v > 1 ? String(v) : undefined },
      }),
  })

  const resetFilters = () =>
    router.push({
      query: { ...route.query, search: undefined, type: undefined, page: undefined },
    })

  const {
    data: overview,
    pending: overviewPending,
    error: overviewError,
    refresh: refreshOverview,
  } = useAsyncData<EtatOrganisationOverview>(
    'etat-organisation-overview',
    () => $fetch('/api/etat-organisation/overview'),
    { server: true },
  )

  const selectedDecreeNumero = computed({
    get: () => (route.query.decree as string) || '',
    set: (v: string) =>
      router.push({
        query: { ...route.query, decree: v || undefined, page: undefined },
      }),
  })

  const {
    data: entitiesResponse,
    pending: entitiesPending,
    error: entitiesError,
    refresh: refreshEntities,
  } = useAsyncData<EtatOrganisationEntitiesResponse>(
    () => `etat-organisation-entities-${selectedDecreeNumero.value || 'active'}`,
    () =>
      $fetch('/api/etat-organisation/entities', {
        query: selectedDecreeNumero.value ? { decree: selectedDecreeNumero.value } : undefined,
      }),
    { server: true, watch: [selectedDecreeNumero] },
  )

  const entities = computed(() => entitiesResponse.value?.entities || [])
  const allDecrees = computed(() => entitiesResponse.value?.allDecrees || [])

  // Normalize string: strip diacritics + lowercase (accent-insensitive search)
  const normalizeStr = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const availableTypes = computed(() => {
    const byCode = new Map<string, { code: string; label: string }>()
    entities.value.forEach(entity => {
      if (!byCode.has(entity.type_code)) {
        byCode.set(entity.type_code, { code: entity.type_code, label: entity.type_label })
      }
    })
    return Array.from(byCode.values()).sort((a, b) => a.label.localeCompare(b.label, 'fr'))
  })

  const filteredEntities = computed(() => {
    const search = normalizeStr(searchTerm.value.trim())

    // Build snapshot lookup map for parent traversal
    const bySnapshotId = new Map<string, (typeof entities.value)[number]>(
      entities.value.filter(e => e.snapshot_id).map(e => [e.snapshot_id!, e]),
    )

    // Step 1 – entities that directly match the search term
    const directMatchIds = new Set<string>()
    for (const entity of entities.value) {
      if (entity.type_code === 'entite_regroupement') continue
      const nameMatch =
        !search ||
        normalizeStr(entity.name).includes(search)
      if (nameMatch && entity.snapshot_id) directMatchIds.add(entity.snapshot_id)
    }

    // Step 2 – when searching, also include children/descendants of direct matches
    const childOfMatchIds = new Set<string>()
    if (search) {
      for (const entity of entities.value) {
        if (entity.type_code === 'entite_regroupement') continue
        if (!entity.parent_snapshot_id) continue
        let parentSnapshotId: string | null | undefined = entity.parent_snapshot_id
        let found = false
        for (let i = 0; i < 25 && parentSnapshotId; i++) {
          if (directMatchIds.has(parentSnapshotId)) { found = true; break }
          parentSnapshotId = bySnapshotId.get(parentSnapshotId)?.parent_snapshot_id
        }
        if (found && entity.snapshot_id) childOfMatchIds.add(entity.snapshot_id)
      }
    }

    // Step 3 – filter: exclude entite_regroupement, apply type chip, apply match sets
    const result = entities.value.filter((entity) => {
      if (entity.type_code === 'entite_regroupement') return false
      if (selectedType.value && entity.type_code !== selectedType.value) return false
      const snapshotId = entity.snapshot_id || ''
      return directMatchIds.has(snapshotId) || childOfMatchIds.has(snapshotId)
    })

    // Step 4 – sort: direct matches first (starts-with > contains), children alphabetically
    return result.sort((a, b) => {
      if (search) {
        const aIsDirect = directMatchIds.has(a.snapshot_id || '')
        const bIsDirect = directMatchIds.has(b.snapshot_id || '')
        if (aIsDirect !== bIsDirect) return aIsDirect ? -1 : 1
        if (aIsDirect) {
          const aStarts = normalizeStr(a.name).startsWith(search)
          const bStarts = normalizeStr(b.name).startsWith(search)
          if (aStarts !== bStarts) return aStarts ? -1 : 1
        }
      }
      return a.name.localeCompare(b.name, 'fr')
    })
  })

  const rootNodes = computed(() =>
    entities.value
      .filter(entity => !entity.parent_id)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  )

  // ---------------------------------------------------------------
  // Tree builder – uses snapshot IDs for reliable hierarchy
  // ---------------------------------------------------------------
  const treeRoots = computed<EtatOrganisationTreeNode[]>(() => {
    const list = entities.value
    if (!list.length) return []

    // Primary map: snapshot_id → node (reliable for parent lookups)
    const nodesBySnapshotId = new Map<string, EtatOrganisationTreeNode>()
    for (const e of list) {
      if (e.snapshot_id) {
        nodesBySnapshotId.set(e.snapshot_id, { ...e, children: [] })
      }
    }

    // Fallback map: public_entity id → node
    const nodesByEntityId = new Map<string, EtatOrganisationTreeNode>()
    for (const node of nodesBySnapshotId.values()) {
      nodesByEntityId.set(node.id, node)
    }

    const roots: EtatOrganisationTreeNode[] = []
    for (const node of nodesBySnapshotId.values()) {
      const parentSnapshotId = node.parent_snapshot_id
      if (!parentSnapshotId) {
        roots.push(node)
      } else {
        const parent =
          nodesBySnapshotId.get(parentSnapshotId) ??
          nodesByEntityId.get(node.parent_id ?? '')
        if (parent) {
          parent.children.push(node)
        } else {
          // Parent not in this decree's snapshot set → treat as root
          roots.push(node)
        }
      }
    }

    const sortChildren = (nodes: EtatOrganisationTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      nodes.forEach(n => sortChildren(n.children))
    }

    // Sort each node's children
    roots.forEach(r => sortChildren(r.children))

    // ── Group sociétés into virtual sub-nodes within each parent ──
    const SOCIETE_GROUP_DEFS = [
      { type_code: 'societe_nationale', name: 'Sociétés nationales' },
      { type_code: 'societe_participation_publique', name: 'Sociétés à participation publique' },
    ]
    const groupSocieteChildren = (node: EtatOrganisationTreeNode) => {
      for (const sg of SOCIETE_GROUP_DEFS) {
        const societes = node.children.filter(c => c.type_code === sg.type_code)
        if (societes.length === 0) continue
        node.children = node.children.filter(c => c.type_code !== sg.type_code)
        const virtualId = `__${sg.type_code}__${node.id}`
        node.children.push({
          id: virtualId,
          snapshot_id: virtualId,
          public_slug: virtualId,
          name: sg.name,
          has_public_page: false,
          type_code: 'entite_regroupement',
          type_label: 'Regroupement',
          code_institution: null,
          parent_snapshot_id: node.snapshot_id,
          parent_id: node.id,
          parent_name: node.name,
          children: societes,
        })
      }
      // Re-sort after injecting virtual nodes
      node.children.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      // Recurse into real children only (skip virtual nodes to avoid infinite loop)
      node.children.forEach(child => {
        if (child.children.length > 0 && !child.id.startsWith('__')) groupSocieteChildren(child)
      })
    }
    roots.forEach(r => groupSocieteChildren(r))

    // ── Group all ministères under a virtual "Ministères" node ──
    const ministreNodes = roots.filter(r => r.type_code === 'ministere')
    const otherRoots = roots.filter(r => r.type_code !== 'ministere')

    // Sort other roots: Présidence first, Primature second, rest alphabetically
    const SORT_ORDER: Record<string, number> = { presidence: 0, primature: 1 }
    otherRoots.sort((a, b) => {
      const oa = SORT_ORDER[a.type_code] ?? 99
      const ob = SORT_ORDER[b.type_code] ?? 99
      if (oa !== ob) return oa - ob
      return a.name.localeCompare(b.name, 'fr')
    })

    // Sort ministères by code_institution (their numeric order), then alphabetically
    ministreNodes.sort((a, b) => {
      const ca = a.code_institution ?? 999
      const cb = b.code_institution ?? 999
      if (ca !== cb) return ca - cb
      return a.name.localeCompare(b.name, 'fr')
    })

    if (ministreNodes.length === 0) {
      return otherRoots
    }

    // Virtual grouping node for all ministères
    const ministreGroupNode: EtatOrganisationTreeNode = {
      id: '__ministeres__',
      snapshot_id: '__ministeres__',
      public_slug: 'ministeres',
      name: 'Ministères',
      has_public_page: false,
      type_code: 'entite_regroupement',
      type_label: 'Regroupement',
      code_institution: null,
      parent_snapshot_id: null,
      parent_id: null,
      parent_name: null,
      children: ministreNodes,
    }

    return [...otherRoots, ministreGroupNode]
  })

  const paginatedEntities = computed(() => {
    const start = (listPage.value - 1) * LIST_PAGE_SIZE
    return filteredEntities.value.slice(start, start + LIST_PAGE_SIZE)
  })

  const listTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredEntities.value.length / LIST_PAGE_SIZE)),
  )

  const childrenCountByRoot = computed(() => {
    const counts = new Map<string, number>()
    const bySnapshotId = new Map(
      entities.value.filter(e => e.snapshot_id).map(e => [e.snapshot_id!, e]),
    )
    const byEntityId = new Map(entities.value.map(e => [e.id, e]))

    const resolveRootSnapshotId = (snapshotId: string, guard = 0): string | null => {
      if (guard > 20) return null
      const entity = bySnapshotId.get(snapshotId)
      if (!entity) return null
      if (!entity.parent_snapshot_id) return snapshotId
      return resolveRootSnapshotId(entity.parent_snapshot_id, guard + 1) ?? snapshotId
    }

    entities.value.forEach(entity => {
      if (!entity.parent_snapshot_id && !entity.parent_id) return
      const snapshotId = entity.snapshot_id
      if (!snapshotId) {
        // fallback: entity id-based
        let current = byEntityId.get(entity.parent_id ?? '')
        while (current?.parent_id) current = byEntityId.get(current.parent_id)
        if (current) counts.set(current.id, (counts.get(current.id) || 0) + 1)
        return
      }
      const rootId = resolveRootSnapshotId(snapshotId)
      if (rootId) counts.set(rootId, (counts.get(rootId) || 0) + 1)
    })

    return counts
  })

  const pending = computed(() => overviewPending.value || entitiesPending.value)
  const error = computed(() => overviewError.value || entitiesError.value)

  // Resolve ministry tutelle for each entity (walk up the snapshot parent chain)
  const ROOT_MINISTRY_TYPES = new Set(['ministere', 'presidence', 'primature'])

  const tutelleBySnapshotId = computed(() => {
    const snapshotMap = new Map(
      entities.value.filter(e => e.snapshot_id).map(e => [e.snapshot_id!, e]),
    )
    const memo = new Map<string, string | null>()

    function resolve(snapshotId: string, guard = 0): string | null {
      if (guard > 25) return null
      if (memo.has(snapshotId)) return memo.get(snapshotId) ?? null
      const e = snapshotMap.get(snapshotId)
      if (!e) { memo.set(snapshotId, null); return null }
      if (ROOT_MINISTRY_TYPES.has(e.type_code)) { memo.set(snapshotId, e.name); return e.name }
      if (!e.parent_snapshot_id) { memo.set(snapshotId, null); return null }
      const tutelle = resolve(e.parent_snapshot_id, guard + 1)
      memo.set(snapshotId, tutelle)
      return tutelle
    }

    const result = new Map<string, string | null>()
    for (const entity of entities.value) {
      if (entity.snapshot_id) result.set(entity.snapshot_id, resolve(entity.snapshot_id))
    }
    return result
  })

  const refresh = async () => {
    await Promise.all([refreshOverview(), refreshEntities()])
  }

  return {
    overview,
    entities,
    treeRoots,
    availableTypes,
    filteredEntities,
    paginatedEntities,
    listPage,
    listTotalPages,
    LIST_PAGE_SIZE,
    rootNodes,
    childrenCountByRoot,
    tutelleBySnapshotId,
    searchTerm,
    selectedType,
    selectedDecreeNumero,
    allDecrees,
    resetFilters,
    pending,
    error,
    refresh,
  }
}
