/**
 * Proxy handler pour les images du CMS
 * Route: /api/cms-images/[...path]
 * 
 * Cette route fait office de proxy pour servir les images depuis le CMS
 * sans exposer l'URL du backend directement au client
 */

export default defineEventHandler(async (event) => {
  // Récupérer le chemin de l'image depuis l'URL
  const path = getRouterParam(event, 'path') || ''
  
  // Récupérer les paramètres de requête
  const query = getQuery(event)
  const quality = query.quality as string | undefined
  
  // Récupérer l'URL du CMS depuis la configuration
  const config = useRuntimeConfig()
  
  // Priorité : CMS_API_URL_ASSETS > CMS_API_URL/assets > cmsApiUrl/assets
  let targetUrl = ''
  
  if (process.env.CMS_API_URL_ASSETS) {
    targetUrl = `${process.env.CMS_API_URL_ASSETS}/${path}`
  } else if (process.env.CMS_API_URL) {
    targetUrl = `${process.env.CMS_API_URL}/assets/${path}`
  } else if (config.public.cmsApiUrl) {
    targetUrl = `${config.public.cmsApiUrl}/assets/${path}`
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'CMS URL not configured'
    })
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
        'User-Agent': 'Nuxt-Proxy',
      }
    })

    // Déterminer le type de contenu
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Définir les headers de cache pour optimiser les performances
    setHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache pendant 1 an
      'X-Proxied-From': new URL(targetUrl).hostname
    })

    // Retourner l'image
    return response._data
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error)
    
    // En cas d'erreur, retourner une erreur 404
    throw createError({
      statusCode: 404,
      statusMessage: 'Image non trouvée'
    })
  }
})