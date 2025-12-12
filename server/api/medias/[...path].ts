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
  
  // Récupérer l'URL du CMS depuis la configuration
  const config = useRuntimeConfig()
  
  // Priorité : CMS_API_URL_ASSETS > CMS_API_URL/assets > cmsApiUrl/assets > fallback
  let targetUrl = ''
  
  if (process.env.CMS_API_URL_ASSETS) {
    targetUrl = `${process.env.CMS_API_URL_ASSETS}/${path}`
  } else if (process.env.CMS_API_URL) {
    targetUrl = `${process.env.CMS_API_URL}/assets/${path}`
  } else if (config.public.cmsApiUrl) {
    targetUrl = `${config.public.cmsApiUrl}/assets/${path}`
  } else {
    // Fallback URL en dur pour la production (temporaire)
    targetUrl = `https://cms.vie-publique.sn/assets/${path}`
    console.warn('Using fallback CMS URL - configure environment variables')
  }
  
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