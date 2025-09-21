/**
 * Composable pour obtenir les informations de version de l'application
 */
export const useAppVersion = () => {
  const config = useRuntimeConfig()
  
  // Version depuis package.json
  const version = config.public.appVersion || 'dev'
  
  // Build timestamp (optionnel)
  const buildTime = config.public.buildTime || null
  
  // Git commit hash (optionnel)
  const gitCommit = config.public.gitCommit || null
  
  // Environment
  const environment = config.public.nodeEnv || 'development'
  
  const isProduction = environment === 'production'
  const isDevelopment = environment === 'development'
  
  // Format d'affichage complet
  const fullVersion = computed(() => {
    let versionString = `v${version}`
    
    // Ajouter le commit hash s'il est disponible
    if (gitCommit && gitCommit !== 'unknown') {
      versionString += ` (${gitCommit.substring(0, 7)})`
    }
    
    // Ajouter la date en production
    if (buildTime && isProduction) {
      try {
        const date = new Date(buildTime)
        if (!isNaN(date.getTime())) {
          versionString += ` - ${date.toLocaleDateString('fr-FR')}`
        }
      } catch (error) {
        // Ignorer les erreurs de date
      }
    }
    
    return versionString
  })
  
  // Version courte pour mobile
  const shortVersion = computed(() => `v${version}`)
  
  return {
    version,
    buildTime,
    gitCommit,
    environment,
    isProduction,
    isDevelopment,
    fullVersion,
    shortVersion
  }
}