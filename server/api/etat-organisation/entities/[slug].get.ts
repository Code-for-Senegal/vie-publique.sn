import { readItems } from '@directus/sdk'
import { CacheDuration, getCacheMaxAge } from '../../../utils/cache'

type DecreeRow = {
  id: string
  numero: string
  status?: string
  date_publication?: string
}

const CHANGE_LABELS: Record<string, string> = {
  created: 'Création',
  rename: 'Renommage',
  reparent: 'Changement de tutelle',
  merge: 'Fusion',
  split: 'Scission',
  deleted: 'Suppression',
}

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Le slug est requis',
      })
    }

    const cmsClient = getCmsClient()

    const decrees = await cmsClient.request(
      readItems('state_organization_decree', {
        fields: ['id', 'numero', 'status', 'date_publication'],
        sort: ['-date_publication'],
        limit: 20,
      }),
    )

    if (!Array.isArray(decrees) || decrees.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Aucun décret disponible',
      })
    }

    const activeDecree =
      (decrees as DecreeRow[]).find(decree => decree.status === 'active') || (decrees as DecreeRow[])[0]

    const snapshots = await cmsClient.request(
      readItems('state_organization_entity_snapshot', {
        filter: {
          decree: { _eq: activeDecree.id },
          // Include change_type=null (entite_regroupement) — excluded by _neq alone in SQL
          _or: [
            { change_type: { _null: true } },
            { change_type: { _neq: 'removed' } },
          ],
        },
        fields: [
          'id',
          'official_label',
          'parent_snapshot', // raw FK UUID — avoids unreliable multi-level M2O expansion
          'public_entity.id',
          'public_entity.slug',
          'public_entity.name',
          'public_entity.has_public_page',
          'public_entity.code_institution',
          'public_entity.entity_type.code',
          'public_entity.entity_type.label',
          'public_entity.email',
          'public_entity.adresse',
          'public_entity.phone',
          'public_entity.web_site',
          'public_entity.reseaux_sociaux',
          'public_entity.logo',
        ],
        sort: ['official_label'],
        limit: -1,
      }),
    )

    const entitiesById = new Map<string, any>()
    const entitiesBySlug = new Map<string, any>()
    const snapshotIdToEntityId = new Map<string, string>()

    for (const snapshot of snapshots as any[]) {
      const entity = snapshot.public_entity
      if (!entity?.id || !entity?.slug || entitiesById.has(String(entity.id))) {
        continue
      }

      const rawParent = snapshot.parent_snapshot
      const parentSnapshotId: string | null =
        rawParent === null || rawParent === undefined
          ? null
          : typeof rawParent === 'object'
            ? (rawParent?.id != null ? String(rawParent.id) : null)
            : String(rawParent)  // handles both legacy string UUIDs and new integer IDs

      const node = {
        id: String(entity.id),
        snapshot_id: String(snapshot.id),
        public_slug: entity.slug,
        name: snapshot.official_label || entity.name || entity.slug,
        has_public_page: entity.has_public_page === true,
        type_code: entity.entity_type?.code || 'other',
        type_label: entity.entity_type?.label || 'Autre',
        code_institution: entity.code_institution ?? null,
        parent_snapshot_id: parentSnapshotId,
        parent_id: null as string | null,
        parent_name: null as string | null,
        email: entity.email ?? null,
        adresse: entity.adresse ?? null,
        phone: entity.phone ?? null,
        web_site: entity.web_site ?? null,
        reseaux_sociaux: (entity.reseaux_sociaux as Record<string, string> | null) ?? null,
        logo: (entity.logo as string | null) ?? null,
      }

      entitiesById.set(node.id, node)
      entitiesBySlug.set(node.public_slug, node)
      snapshotIdToEntityId.set(String(snapshot.id), node.id)
    }

    // Post-process: resolve parent_id and parent_name via snapshot ID lookup
    for (const node of entitiesById.values()) {
      if (node.parent_snapshot_id) {
        const parentEntityId = snapshotIdToEntityId.get(node.parent_snapshot_id)
        if (parentEntityId) {
          const parentNode = entitiesById.get(parentEntityId)
          if (parentNode) {
            node.parent_id = parentNode.id
            node.parent_name = parentNode.name
          }
        }
      }
    }

    const target = entitiesBySlug.get(slug)

    if (!target || !target.has_public_page) {
      throw createError({
        statusCode: 404,
        message: 'Entité publique non trouvée',
      })
    }

    const directChildren = Array.from(entitiesById.values())
      .filter(node => node.parent_id === target.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

    const children = directChildren.map(child => ({
      ...child,
      subchildren:
        child.type_code === 'entite_regroupement' || child.type_code === 'etablissement_public'
          ? Array.from(entitiesById.values())
              .filter(n => n.parent_id === child.id)
              .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
          : [],
    }))

    const breadcrumb: Array<{ id: string; public_slug: string; name: string }> = []
    let currentParentId = target.parent_id
    let guard = 0

    while (currentParentId && guard < 25) {
      const parent = entitiesById.get(currentParentId)
      if (!parent) {
        break
      }
      breadcrumb.unshift({
        id: parent.id,
        public_slug: parent.public_slug,
        name: parent.name,
      })
      currentParentId = parent.parent_id
      guard += 1
    }

    const changes = await cmsClient
      .request(
        readItems('state_organization_entity_change', {
          fields: [
            'id',
            'change_category',
            'description',
            'from_decree.numero',
            'to_decree.numero',
            'date_created',
          ],
          filter: {
            entity: { _eq: target.id },
          },
          sort: ['-date_created'],
          limit: -1,
        }),
      )
      .catch(() => [])

    return {
      decree: {
        id: activeDecree.id,
        numero: activeDecree.numero,
        date_publication: activeDecree.date_publication,
        status: activeDecree.status,
      },
      entity: target,
      children,
      breadcrumb,
      history: (changes as any[]).map(change => ({
        id: change.id,
        category: change.change_category,
        label: CHANGE_LABELS[change.change_category] || change.change_category,
        description: change.description,
        from_decree: change.from_decree?.numero || null,
        to_decree: change.to_decree?.numero || null,
        date_created: change.date_created,
      })),
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.MEDIUM),
    name: 'etat-organisation-entity-detail-v6',
    getKey: event => {
      const slug = getRouterParam(event, 'slug')
      return `etat-organisation-entity-${slug}`
    },
  },
)
