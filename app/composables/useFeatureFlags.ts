import type { FeatureFlag, AppEnvironment } from '~/config/features.config'
import { VALID_ENVIRONMENTS } from '~/config/features.config'

interface UseFeatureFlagsReturn {
  isFeatureEnabled: (featureKey: string) => boolean
  getFeatureFlag: (featureKey: string) => FeatureFlag | undefined
  flags: Ref<FeatureFlag[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  currentEnv: Ref<AppEnvironment>
}

/**
 * Composable pour gérer les feature flags
 *
 * @example
 * const { isFeatureEnabled } = useFeatureFlags()
 * if (isFeatureEnabled('menu_elections')) {
 *   // Afficher le menu élections
 * }
 */
export function useFeatureFlags(): UseFeatureFlagsReturn {
  const config = useRuntimeConfig()
  const flags = useState<FeatureFlag[]>('feature-flags', () => [])
  const loading = useState<boolean>('feature-flags-loading', () => false)
  const error = useState<Error | null>('feature-flags-error', () => null)

  // Récupérer l'environnement actuel depuis la config runtime
  const currentEnv = computed<AppEnvironment>(() => {
    const env = config.public.appEnv as AppEnvironment | undefined

    if (env && VALID_ENVIRONMENTS.includes(env)) {
      return env
    }

    // Fallback sur 'production' pour la sécurité
    console.warn(`Invalid or missing NUXT_PUBLIC_APP_ENV: ${env}, defaulting to 'production'`)
    return 'production'
  })

  /**
   * Charge les feature flags depuis l'API
   */
  async function loadFlags() {
    if (flags.value.length > 0) {
      // Déjà chargé, pas besoin de recharger
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<FeatureFlag[]>('/api/features/flags')
      flags.value = data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load feature flags')
      console.error('Error loading feature flags:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Rafraîchit les feature flags
   */
  async function refresh() {
    flags.value = []
    await loadFlags()
  }

  /**
   * Vérifie si une feature est activée
   *
   * Règle : Une feature est visible si :
   * 1. enabled = true
   * 2. L'environnement actuel est dans la liste environments
   */
  function isFeatureEnabled(featureKey: string): boolean {
    const flag = flags.value.find((f) => f.key === featureKey)

    if (!flag) {
      // Feature non trouvée, on la considère comme désactivée
      console.warn(`Feature flag not found: ${featureKey}`)
      return false
    }

    // Vérifier si la feature est activée
    if (!flag.enabled) {
      return false
    }

    // Vérifier si l'environnement actuel est autorisé
    const isEnvAllowed = flag.environments.includes(currentEnv.value as AppEnvironment)

    return isEnvAllowed
  }

  /**
   * Récupère un feature flag par sa clé
   */
  function getFeatureFlag(featureKey: string): FeatureFlag | undefined {
    return flags.value.find((f) => f.key === featureKey)
  }

  // Charger les flags au premier appel
  if (process.client && flags.value.length === 0 && !loading.value) {
    loadFlags()
  }

  return {
    isFeatureEnabled,
    getFeatureFlag,
    flags,
    loading,
    error,
    refresh,
    currentEnv,
  }
}
