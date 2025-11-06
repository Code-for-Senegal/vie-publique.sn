/**
 * Composable pour le détail d'une entité publique
 */

import type { StateEntityDetailResponse } from '~/types/state-entity'

export function useStateEntityDetail(slug: string | Ref<string>) {
  const slugRef = isRef(slug) ? slug : ref(slug)

  const {
    data: response,
    pending,
    error,
    refresh,
  } = useAsyncData<StateEntityDetailResponse>(
    `state-entity-${slugRef.value}`,
    () => $fetch(`/api/state/entities/${slugRef.value}`),
    {
      watch: [slugRef],
      server: true,
    },
  )

  // Données extraites
  const entity = computed(() => response.value?.entity)
  const children = computed(() => response.value?.children || [])
  const history = computed(() => response.value?.history || [])
  const breadcrumb = computed(() => response.value?.breadcrumb || [])

  // Métadonnées utiles
  const hasChildren = computed(() => children.value.length > 0)
  const hasHistory = computed(() => history.value.length > 0)
  const isActive = computed(() => entity.value?.status === 'active')
  const parentEntity = computed(() => entity.value?.parent_entity)

  // Grouper les enfants par type
  const childrenByType = computed(() => {
    const grouped = new Map<string, typeof children.value>()
    children.value.forEach((child) => {
      const type = child.type
      if (!grouped.has(type)) {
        grouped.set(type, [])
      }
      grouped.get(type)!.push(child)
    })
    return grouped
  })

  return {
    // Données principales
    entity,
    children,
    history,
    breadcrumb,

    // États
    pending,
    error,

    // Métadonnées
    hasChildren,
    hasHistory,
    isActive,
    parentEntity,
    childrenByType,

    // Actions
    refresh,
  }
}
