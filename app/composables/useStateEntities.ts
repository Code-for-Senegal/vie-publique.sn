/**
 * Composable pour la gestion de la liste des entités publiques
 * Suit le pattern: sync URL ↔ filtres ↔ API
 */

import type {
  StateEntityListResponse,
  StateEntityFilters,
  StateEntityType,
} from '~/types/state-entity'

export function useStateEntities() {
  const route = useRoute()
  const router = useRouter()

  // État des filtres synchronisé avec l'URL (PAS de filtre status)
  // Par défaut : afficher les ministères

  // Parser le type depuis l'URL proprement
  const getTypeFromQuery = () => {
    const typeParam = route.query.type
    console.log('getTypeFromQuery - raw query.type:', typeParam, typeof typeParam)

    if (!typeParam || typeParam === '[object Object]') {
      return 'ministry' // défaut
    }

    return typeParam as StateEntityType
  }

  const filters = ref<StateEntityFilters>({
    search: (route.query.search as string) || '',
    type: getTypeFromQuery(),
    parent_id: route.query.parent_id ? Number(route.query.parent_id) : undefined,
    page: route.query.page ? Number(route.query.page) : 1,
    limit: route.query.limit ? Number(route.query.limit) : 20,
    sort: route.query.sort ? (route.query.sort as string).split(',') : ['name'],
  })

  // Charger TOUTES les données sans filtres (on filtre côté client pour l'instant)
  const {
    data: response,
    pending,
    error,
    refresh,
  } = useAsyncData<StateEntityListResponse>(
    'state-entities-all',
    () => $fetch('/api/state/entities', { query: { limit: -1 } }), // Récupère tout
    {
      server: true,
    },
  )

  // Filtrer les données côté client selon le type sélectionné
  const filteredEntities = computed(() => {
    let result = response.value?.data || []

    // Filtre par recherche
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.slug?.toLowerCase().includes(search)
      )
    }

    // Filtre par type (utiliser type_info.code)
    if (filters.value.type) {
      result = result.filter((e: any) => e.type_info?.code === filters.value.type)
    }
    // Pour l'instant on skip ce filtre car on ne connait pas la relation type
    // if (filters.value.type) {
    //   result = result.filter(e => e.type === filters.value.type)
    // }

    return result
  })

  // Pagination côté client
  const entities = computed(() => {
    const start = (filters.value.page! - 1) * filters.value.limit!
    const end = start + filters.value.limit!
    return filteredEntities.value.slice(start, end)
  })

  const meta = computed(() => {
    const totalCount = filteredEntities.value.length
    return {
      total_count: totalCount,
      filter_count: totalCount,
      page: filters.value.page!,
      limit: filters.value.limit!,
      total_pages: Math.ceil(totalCount / filters.value.limit!),
    }
  })

  // Méthode pour mettre à jour les filtres et l'URL
  const updateFilters = (newFilters: Partial<StateEntityFilters>) => {
    // Réinitialiser la page si on change un filtre autre que la page
    if (!('page' in newFilters)) {
      newFilters.page = 1
    }

    // Mettre à jour les filtres
    filters.value = {
      ...filters.value,
      ...newFilters,
    }

    // Construire la query proprement en convertissant tout en string
    const cleanQuery: Record<string, string> = {}

    // Conserver la vue
    if (route.query.view) {
      cleanQuery.view = String(route.query.view)
    }

    // Ajouter les filtres actifs (conversion explicite en string)
    if (filters.value.search && filters.value.search.trim()) {
      cleanQuery.search = String(filters.value.search)
    }

    if (filters.value.type) {
      cleanQuery.type = String(filters.value.type)
    }

    if (filters.value.parent_id !== undefined && filters.value.parent_id !== null) {
      cleanQuery.parent_id = String(filters.value.parent_id)
    }

    if (filters.value.page && filters.value.page !== 1) {
      cleanQuery.page = String(filters.value.page)
    }

    // Sync avec l'URL (seulement les strings)
    router.push({
      query: cleanQuery,
    })
  }

  // Méthodes utilitaires - conversion explicite
  const setSearch = (search: string) => updateFilters({ search: search || undefined })
  const setType = (type: StateEntityType | undefined) => {
    console.log('setType called with:', type, typeof type)
    updateFilters({ type })
  }
  const setParentId = (parent_id: number | undefined) => updateFilters({ parent_id })
  const setPage = (page: number) => updateFilters({ page })

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
    setParentId,
    setPage,
    refresh,
  }
}
