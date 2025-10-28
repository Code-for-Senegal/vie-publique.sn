/**
 * Composable pour les statistiques des entités publiques
 */

import type { StateEntityStats } from '~/types/state-entity'

export function useStateStats() {
  const {
    data: stats,
    pending,
    error,
    refresh,
  } = useAsyncData<StateEntityStats>('state-stats', () => $fetch('/api/state/stats'), {
    server: true,
  })

  return {
    stats,
    pending,
    error,
    refresh,
  }
}
