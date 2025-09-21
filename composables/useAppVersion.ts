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
    
    if (gitCommit) {
      versionString += ` (${gitCommit.substring(0, 7)})`
    }
    
    if (buildTime && isProduction) {
      const date = new Date(buildTime)
      versionString += ` - ${date.toLocaleDateString('fr-FR')}`
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