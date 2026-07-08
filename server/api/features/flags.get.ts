import { readItems } from '@directus/sdk'
import type { FeatureFlag } from '~/config/features.config'
import { DEFAULT_FEATURES } from '~/config/features.config'

/**
 * API endpoint pour récupérer les feature flags depuis Directus
 * Cache de 5 minutes pour optimiser les performances
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig()

    // Si le système de feature flags est désactivé, retourner les valeurs par défaut
    if (config.public.featureFlagsEnabled === false) {
      return Object.values(DEFAULT_FEATURES)
    }

    try {
      const directus = getCmsClient()

      // Récupérer tous les feature flags depuis Directus
      const flags = await directus.request(
        readItems('vp_feature_flags', {
          fields: ['key', 'enabled', 'environments', 'description'],
          limit: -1, // Récupérer tous les flags
        }),
      )

      // Transformer les données au format FeatureFlag
      const transformedFlags: FeatureFlag[] = flags.map((flag: any) => ({
        key: flag.key,
        enabled: flag.enabled,
        // Gérer le cas où environments est une string JSON ou un array
        environments:
          typeof flag.environments === 'string'
            ? JSON.parse(flag.environments)
            : flag.environments,
        description: flag.description,
      }))

      // Fusionner : Directus flags écrasent les defaults, mais les flags
      // définis localement et absents de Directus restent disponibles
      const directusKeys = new Set(transformedFlags.map((f) => f.key))
      const localOnlyFlags = Object.values(DEFAULT_FEATURES).filter(
        (f) => !directusKeys.has(f.key),
      )

      return [...transformedFlags, ...localOnlyFlags]
    } catch (error) {
      console.error('Error fetching feature flags from Directus:', error)

      // Fallback sur les valeurs par défaut en cas d'erreur
      return Object.values(DEFAULT_FEATURES)
    }
  },
  {
    maxAge: 60 * 5, // Cache de 5 minutes
    name: 'feature-flags',
    getKey: () => 'feature-flags',
  },
)
