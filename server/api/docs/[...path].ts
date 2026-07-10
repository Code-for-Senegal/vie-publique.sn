/**
 * Proxy handler pour les documents (PDFs, Word, Excel, etc.)
 * Route: /api/docs/[...path]
 *
 * URLs SEO-friendly pour les documents
 * Exemple: /api/docs/rapports/rapport-annuel-2024.pdf
 */

export default defineEventHandler(async (event) => {
  // Récupérer le chemin du document depuis l'URL
  const path = getRouterParam(event, 'path') || ''
  
  const config = useRuntimeConfig()
  const cmsBase = config.cmsApiUrl || 'https://cms.vie-publique.sn'
  let targetUrl = `${cmsBase}/assets/${path}`
  
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
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN' // Permet l'ouverture dans iframe
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