import type { FeatureFlag, AppEnvironment } from '~/config/features.config'
import { VALID_ENVIRONMENTS } from '~/config/features.config'

interface UseFeatureFlagsReturn {
  isFeatureEnabled: (featureKey: string) => boolean
  getFeatureFlag: (featureKey: string) => FeatureFlag | undefined
  flags: Ref<FeatureFlag[] | null>
  loading: Ref<boolean>
  error: Ref<any>
  refresh: () => Promise<void>
  currentEnv: Ref<AppEnvironment>
}

/**
 * Composable pour gérer les feature flags
 * Compatible SSR + Client avec useAsyncData
 *
 * @example
 * const { isFeatureEnabled } = useFeatureFlags()
 * if (isFeatureEnabled('menu_elections')) {
 *   // Afficher le menu élections
 * }
 */
export function useFeatureFlags(): UseFeatureFlagsReturn {
  const config = useRuntimeConfig()

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

  // Utiliser useFetch pour charger les flags (SSR + Client automatique)
  const { data: flags, pending: loading, error, refresh } = useFetch<FeatureFlag[]>(
    '/api/features/flags',
    {
      key: 'feature-flags',
      default: () => [], // Valeur par défaut si erreur
    }
  )

  /**
   * Vérifie si une feature est activée
   *
   * Règle : Une feature est visible si :
   * 1. enabled = true
   * 2. L'environnement actuel est dans la liste environments
   */
  function isFeatureEnabled(featureKey: string): boolean {
    // Si les flags ne sont pas encore chargés, retourner false
    if (!flags.value || flags.value.length === 0) {
      return false
    }

    const flag = flags.value.find((f) => f.key === featureKey)

    if (!flag) {
      // Feature non trouvée, on la considère comme désactivée
      // console.warn(`Feature flag not found: ${featureKey}`)
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
    if (!flags.value) return undefined
    return flags.value.find((f) => f.key === featureKey)
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
