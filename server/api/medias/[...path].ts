/**
 * Proxy handler pour les médias (images, vidéos)
 * Route: /api/medias/[...path]
 *
 * URLs SEO-friendly pour les médias (LEGACY - utiliser /cms/ pour les nouveaux assets)
 * Exemple: /api/medias/photos/actualite-senegal.jpg
 */

export default defineEventHandler(async (event) => {
  // Récupérer le chemin du média depuis l'URL
  const path = getRouterParam(event, 'path') || ''
  
  // Récupérer les paramètres de requête (pour la qualité des images)
  const query = getQuery(event)
  const quality = query.quality as string | undefined
  
  const config = useRuntimeConfig()
  const cmsBase = config.cmsApiUrl || 'https://cms.vie-publique.sn'
  let targetUrl = `${cmsBase}/assets/${path}`
  
  // Ajouter les paramètres de transformation Directus si nécessaire
  if (quality) {
    targetUrl += `?quality=${quality}`
  }
  
  try {
    // Faire la requête vers le CMS
    const response = await $fetch.raw(targetUrl, {
      responseType: 'arrayBuffer',
      headers: {
        'User-Agent': 'Nuxt-Proxy-Media',
      }
    })

    // Déterminer le type de contenu
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Définir les headers de cache pour optimiser les performances
    setHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache pendant 1 an
      'X-Proxied-From': new URL(targetUrl).hostname,
      'X-Content-Type-Options': 'nosniff'
    })

    // Retourner le média
    return response._data
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error)
    
    // En cas d'erreur, retourner une erreur 404
    throw createError({
      statusCode: 404,
      statusMessage: 'Média non trouvé'
    })
  }
})