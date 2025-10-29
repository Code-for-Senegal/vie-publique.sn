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
    console.log('updateFilters called with:', newFilters)

    // Réinitialiser la page si on change un filtre autre que la page
    const resetPage = !('page' in newFilters)

    // Mettre à jour les filtres UN PAR UN pour éviter les problèmes de proxy
    if ('search' in newFilters) filters.value.search = newFilters.search
    if ('type' in newFilters) filters.value.type = newFilters.type
    if ('parent_id' in newFilters) filters.value.parent_id = newFilters.parent_id
    if ('page' in newFilters) filters.value.page = newFilters.page
    if (resetPage) filters.value.page = 1

    // Construire la query proprement (only primitives)
    const queryParams: any = {}

    // Vue
    if (route.query.view) {
      queryParams.view = route.query.view
    }

    // Filtres
    if (filters.value.search?.trim()) {
      queryParams.search = filters.value.search.trim()
    }

    if (filters.value.type && filters.value.type !== 'ministry') {
      queryParams.type = filters.value.type
    }

    if (filters.value.parent_id) {
      queryParams.parent_id = String(filters.value.parent_id)
    }

    if (filters.value.page && filters.value.page > 1) {
      queryParams.page = String(filters.value.page)
    }

    console.log('Pushing query:', queryParams)

    // Sync avec l'URL
    router.replace({
      query: queryParams,
    })
  }

  // Méthodes utilitaires - conversion explicite et sans spread
  const setSearch = (search: string) => {
    filters.value.search = search || ''
    filters.value.page = 1

    const q: any = {}
    if (route.query.view) q.view = route.query.view
    if (search) q.search = search
    if (filters.value.type && filters.value.type !== 'ministry') q.type = filters.value.type

    router.replace({ query: q })
  }

  const setType = (type: StateEntityType | undefined) => {
    console.log('setType called with:', type, typeof type, 'is string?', typeof type === 'string')

    // Force conversion en string pur
    const typeStr = type ? String(type) : 'ministry'
    console.log('typeStr:', typeStr, typeof typeStr)

    filters.value.type = typeStr as StateEntityType
    filters.value.page = 1

    const q: any = {}
    if (route.query.view) q.view = route.query.view
    if (filters.value.search) q.search = filters.value.search
    if (typeStr && typeStr !== 'ministry') q.type = typeStr

    console.log('query to push:', q)
    router.replace({ query: q })
  }

  const setParentId = (parent_id: number | undefined) => {
    filters.value.parent_id = parent_id
    filters.value.page = 1

    const q: any = {}
    if (route.query.view) q.view = route.query.view
    if (filters.value.search) q.search = filters.value.search
    if (filters.value.type && filters.value.type !== 'ministry') q.type = filters.value.type
    if (parent_id) q.parent_id = String(parent_id)

    router.replace({ query: q })
  }

  const setPage = (page: number) => {
    filters.value.page = page

    const q: any = {}
    if (route.query.view) q.view = route.query.view
    if (filters.value.search) q.search = filters.value.search
    if (filters.value.type && filters.value.type !== 'ministry') q.type = filters.value.type
    if (page > 1) q.page = String(page)

    router.replace({ query: q })
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
    setParentId,
    setPage,
    refresh,
  }
}
