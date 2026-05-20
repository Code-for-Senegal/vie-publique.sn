import { readItems } from '@directus/sdk'
import { getCacheMaxAge } from '~~/server/utils/cache'

type DecreeRow = {
  id: string
  numero: string
  status?: string
  date_publication?: string
}

type EntityNode = {
  id: string
  snapshot_id: string
  public_slug: string
  name: string
  canonical_name: string
  has_public_page: boolean
  type_code: string
  type_label: string
  code_institution?: number | null
  // Snapshot FK (reliable hierarchy key)
  parent_snapshot_id: string | null
  // Public entity FK (derived, for display)
  parent_id: string | null
  parent_name: string | null
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
        entities: [],
      }
    }

    const activeDecree =
      (decrees as DecreeRow[]).find(decree => decree.status === 'active') || (decrees as DecreeRow[])[0]

    const snapshots = await cmsClient.request(
      readItems('entity_snapshots', {
        filter: {
          decree: { _eq: activeDecree.id },
          // Include null change_type (entite_regroupement) + all non-removed
          // NOTE: change_type=null means entite_regroupement — excluded by _neq alone in SQL
          _or: [
            { change_type: { _null: true } },
            { change_type: { _neq: 'removed' } },
          ],
        },
        fields: [
          'id',
          'official_label',
          // Raw FK UUID — no expansion, works 100% reliably for self-referential M2O
          'parent_snapshot',
          'public_entity.id',
          'public_entity.slug',
          'public_entity.canonical_name',
          'public_entity.has_public_page',
          'public_entity.code_institution',
          'public_entity.entity_type.code',
          'public_entity.entity_type.label',
        ],
        sort: ['official_label'],
        limit: -1,
      }),
    )

    const entitiesMap = new Map<string, EntityNode>()
    // snapshot_id → entity_id for parent_name resolution
    const snapshotToEntityId = new Map<string, string>()

    for (const snapshot of snapshots as any[]) {
      const entity = snapshot.public_entity
      if (!entity?.id || !entity?.slug) {
        continue
      }
      if (entitiesMap.has(entity.id)) {
        continue
      }

      // parent_snapshot is returned as raw UUID string (or null) when not expanded
      const rawParent = snapshot.parent_snapshot
      const parentSnapshotId: string | null =
        typeof rawParent === 'string' && rawParent
          ? rawParent
          : typeof rawParent === 'object' && rawParent !== null
            ? (rawParent.id ?? null)
            : null

      const node: EntityNode = {
        id: entity.id,
        snapshot_id: snapshot.id,
        public_slug: entity.slug,
        name: snapshot.official_label || entity.canonical_name || entity.slug,
        canonical_name: entity.canonical_name || snapshot.official_label || entity.slug,
        has_public_page: entity.has_public_page === true,
        type_code: entity.entity_type?.code || 'other',
        type_label: entity.entity_type?.label || 'Autre',
        code_institution: entity.code_institution ?? null,
        parent_snapshot_id: parentSnapshotId,
        parent_id: null,
        parent_name: null,
      }

      entitiesMap.set(entity.id, node)
      snapshotToEntityId.set(snapshot.id, entity.id)
    }

    // Post-process: resolve parent names via snapshot_id lookup
    const snapshotIdToNode = new Map<string, EntityNode>()
    for (const node of entitiesMap.values()) {
      if (node.snapshot_id) snapshotIdToNode.set(node.snapshot_id, node)
    }
    for (const node of entitiesMap.values()) {
      if (node.parent_snapshot_id) {
        const parentNode = snapshotIdToNode.get(node.parent_snapshot_id)
        if (parentNode) {
          node.parent_id = parentNode.id
          node.parent_name = parentNode.canonical_name
        }
      }
    }

    return {
      decree: {
        id: activeDecree.id,
        numero: activeDecree.numero,
        date_publication: activeDecree.date_publication,
        status: activeDecree.status,
      },
      entities: Array.from(entitiesMap.values()),
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.MEDIUM),
    name: 'etat-organisation-entities-v4',
  },
)
