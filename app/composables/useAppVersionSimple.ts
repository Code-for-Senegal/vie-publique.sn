/**
 * Version simplifiée si les variables d'environnement ne fonctionnent pas
 */
export const useAppVersionSimple = () => {
  // Version statique depuis le package.json au build
  const version = '2.0.0' // Mise à jour manuelle nécessaire
  
  // Date de build au moment de la compilation
  const buildDate = new Date().toLocaleDateString('fr-FR')
  
  const fullVersion = computed(() => {
    return `v${version} - ${buildDate}`
  })
  
  const shortVersion = computed(() => `v${version}`)
  
  return {
    version,
    fullVersion,
    shortVersion,
    buildDate,
    isProduction: process.env.NODE_ENV === 'production'
  }
}