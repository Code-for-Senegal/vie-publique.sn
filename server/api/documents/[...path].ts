/**
 * Proxy handler pour les documents (PDFs, Word, Excel, etc.)
 * Route: /documents/[...path]
 * 
 * URLs SEO-friendly pour les documents
 * Exemple: /documents/rapports/rapport-annuel-2024.pdf
 */

export default defineEventHandler(async (event) => {
  // Récupérer le chemin du document depuis l'URL
  const path = getRouterParam(event, 'path') || ''
  
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
  
  try {
    // Faire la requête vers le CMS
    const response = await $fetch.raw(targetUrl, {
      responseType: 'arrayBuffer',
      headers: {
        'User-Agent': 'Nuxt-Proxy-Documents',
      }
    })

    // Déterminer le type de contenu
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Déterminer le nom du fichier pour le download
    let filename = path.split('/').pop() || 'document'
    if (!filename.includes('.')) {
      // Ajouter l'extension basée sur le content-type
      if (contentType.includes('pdf')) {
        filename += '.pdf'
      } else if (contentType.includes('word')) {
        filename += '.docx'
      } else if (contentType.includes('excel')) {
        filename += '.xlsx'
      }
    }
    
    // Définir les headers appropriés pour les documents
    setHeaders(event, {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400', // Cache 24h pour les documents
      'X-Proxied-From': new URL(targetUrl).hostname,
      'X-Content-Type-Options': 'nosniff'
    })

    // Retourner le document
    return response._data
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error)
    
    // En cas d'erreur, retourner une erreur 404
    throw createError({
      statusCode: 404,
      statusMessage: 'Document non trouvé'
    })
  }
})