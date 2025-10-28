/**
 * Composable pour la gestion de la liste des entités publiques
 * Suit le pattern: sync URL ↔ filtres ↔ API
 */

import type {
  StateEntityListResponse,
  StateEntityFilters,
  StateEntityType,
  StateEntityStatus,
} from '~/types/state-entity'

export function useStateEntities() {
  const route = useRoute()
  const router = useRouter()

  // État des filtres synchronisé avec l'URL
  const filters = ref<StateEntityFilters>({
    search: (route.query.search as string) || '',
    type: (route.query.type as StateEntityType) || undefined,
    status: (route.query.status as StateEntityStatus) || 'active',
    parent_id: route.query.parent_id ? Number(route.query.parent_id) : undefined,
    page: route.query.page ? Number(route.query.page) : 1,
    limit: route.query.limit ? Number(route.query.limit) : 20,
    sort: route.query.sort ? (route.query.sort as string).split(',') : ['name'],
  })

  // Charger les données avec useAsyncData (SSR-friendly)
  const {
    data: response,
    pending,
    error,
    refresh,
  } = useAsyncData<StateEntityListResponse>(
    'state-entities',
    () => $fetch('/api/state/entities', { query: filters.value }),
    {
      watch: [filters],
      server: true,
    },
  )

  // Données et métadonnées
  const entities = computed(() => response.value?.data || [])
  const meta = computed(() => response.value?.meta)

  // Méthode pour mettre à jour les filtres et l'URL
  const updateFilters = (newFilters: Partial<StateEntityFilters>) => {
    // Réinitialiser la page si on change un filtre autre que la page
    if (!('page' in newFilters)) {
      newFilters.page = 1
    }

    filters.value = {
      ...filters.value,
      ...newFilters,
    }

    // Sync avec l'URL
    router.push({
      query: {
        ...route.query,
        ...newFilters,
      },
    })
  }

  // Méthodes utilitaires
  const setSearch = (search: string) => updateFilters({ search })
  const setType = (type: StateEntityType | undefined) => updateFilters({ type })
  const setStatus = (status: StateEntityStatus | undefined) => updateFilters({ status })
  const setParentId = (parent_id: number | undefined) => updateFilters({ parent_id })
  const setPage = (page: number) => updateFilters({ page })
  const resetFilters = () => {
    filters.value = {
      search: '',
      type: undefined,
      status: 'active',
      parent_id: undefined,
      page: 1,
      limit: 20,
      sort: ['name'],
    }
    router.push({ query: {} })
  }

  return {
    // État
    entities,
    meta,
    filters: readonly(filters),
    pending,
    error,

    // Actions
    updateFilters,
    setSearch,
    setType,
    setStatus,
    setParentId,
    setPage,
    resetFilters,
    refresh,
  }
}
