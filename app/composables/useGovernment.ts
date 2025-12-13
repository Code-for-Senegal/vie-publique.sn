import type { GovernmentMember } from '~/types/government-member'

export interface GovernmentData {
  government: {
    primeMinister: GovernmentMember | null
    ministers: GovernmentMember[]
    secretariesOfState: GovernmentMember[]
  }
  stats: {
    total: number
    ministers: number
    secretariesOfState: number
    women: number
    men: number
  }
  lastUpdate: string
}

/**
 * Composable pour récupérer le gouvernement actuel du Sénégal
 * Respecte l'architecture standardisée du projet (guideline-api.md)
 */
export const useGovernment = () => {
  // Utilisation de useFetch pour SSR (conforme aux guidelines)
  const { data, pending, error, refresh } = useFetch<GovernmentData>(
    '/api/government/current',
    {
      key: 'government-current',
      // Transformation pour faciliter l'usage dans les composants
      default: () => ({
        government: {
          primeMinister: null,
          ministers: [],
          secretariesOfState: [],
        },
        stats: {
          total: 0,
          ministers: 0,
          secretariesOfState: 0,
          women: 0,
          men: 0,
        },
        lastUpdate: new Date().toISOString().split('T')[0],
      }),
    }
  )

  // Computed pour faciliter l'accès aux données
  const primeMinister = computed(() => data.value?.government.primeMinister || null)
  const ministers = computed(() => data.value?.government.ministers || [])
  const secretariesOfState = computed(() => data.value?.government.secretariesOfState || [])
  const stats = computed(() => data.value?.stats || {
    total: 0,
    ministers: 0,
    secretariesOfState: 0,
    women: 0,
    men: 0,
  })

  // Tous les membres (utile pour itération globale)
  const allMembers = computed(() => [
    ...(primeMinister.value ? [primeMinister.value] : []),
    ...ministers.value,
    ...secretariesOfState.value,
  ])

  return {
    // Données
    governmentData: data,
    primeMinister,
    ministers,
    secretariesOfState,
    allMembers,
    stats,

    // États
    loading: pending,
    error,

    // Méthodes
    refresh,
  }
}
