import type { EtatOrganisationChangesResponse } from '~~/types/etat-organisation'

export function useEtatOrganisationChanges() {
  const route = useRoute()
  const router = useRouter()

  // URL params use decree numero ("2024-940"), never UUIDs
  const fromNumero = computed({
    get: () => (route.query.from as string) || '',
    set: (v: string) =>
      router.push({ query: { ...route.query, from: v || undefined, page: undefined } }),
  })

  const toNumero = computed({
    get: () => (route.query.to as string) || '',
    set: (v: string) =>
      router.push({ query: { ...route.query, to: v || undefined, page: undefined } }),
  })

  const selectedCategory = computed({
    get: () => (route.query.category as string) || '',
    set: (v: string) =>
      router.push({ query: { ...route.query, category: v || undefined, page: undefined } }),
  })

  const currentPage = computed({
    get: () => Math.max(1, parseInt((route.query.page as string) || '1', 10) || 1),
    set: (v: number) =>
      router.push({ query: { ...route.query, page: v > 1 ? String(v) : undefined } }),
  })

  const fetchParams = computed(() => ({
    from: fromNumero.value || undefined,
    to: toNumero.value || undefined,
    category: selectedCategory.value || undefined,
    page: currentPage.value > 1 ? String(currentPage.value) : undefined,
  }))

  const {
    data: changesResponse,
    pending,
    error,
    refresh,
  } = useAsyncData<EtatOrganisationChangesResponse>(
    // Dynamic key — auto-refetches when key changes (no need for `watch`)
    () =>
      `etat-changes-${fromNumero.value || 'prev'}-${toNumero.value || 'active'}-${selectedCategory.value || 'all'}-p${currentPage.value}`,
    () => $fetch('/api/etat-organisation/changes', { query: fetchParams.value }),
    {
      // lazy: page renders immediately; data loads without blocking navigation
      lazy: true,
    },
  )

  const changes = computed(() => changesResponse.value?.changes ?? [])
  const summary = computed(() => changesResponse.value?.summary ?? [])
  const allDecrees = computed(() => changesResponse.value?.allDecrees ?? [])
  const fromDecree = computed(() => changesResponse.value?.from_decree ?? null)
  const toDecree = computed(() => changesResponse.value?.to_decree ?? null)
  const total = computed(() => changesResponse.value?.total ?? 0)
  const pageSize = computed(() => changesResponse.value?.pageSize ?? 30)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const resetFilters = () =>
    router.push({ query: { ...route.query, category: undefined, page: undefined } })

  return {
    fromNumero,
    toNumero,
    selectedCategory,
    currentPage,
    changes,
    summary,
    allDecrees,
    fromDecree,
    toDecree,
    total,
    pageSize,
    totalPages,
    pending,
    error,
    refresh,
    resetFilters,
  }
}
