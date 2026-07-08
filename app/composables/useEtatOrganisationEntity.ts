import type { EtatOrganisationEntityDetailResponse } from '~~/types/etat-organisation'

export function useEtatOrganisationEntity(slug: string | Ref<string>) {
  const slugRef = isRef(slug) ? slug : ref(slug)

  const {
    data: response,
    pending,
    error,
    refresh,
  } = useAsyncData<EtatOrganisationEntityDetailResponse>(
    () => `etat-organisation-entity-${slugRef.value}`,
    () => $fetch(`/api/etat-organisation/entities/${slugRef.value}`),
    {
      watch: [slugRef],
      server: true,
    },
  )

  const decree = computed(() => response.value?.decree || null)
  const entity = computed(() => response.value?.entity || null)
  const children = computed(() => response.value?.children || [])
  const breadcrumb = computed(() => response.value?.breadcrumb || [])
  const history = computed(() => response.value?.history || [])

  return {
    decree,
    entity,
    children,
    breadcrumb,
    history,
    pending,
    error,
    refresh,
  }
}
