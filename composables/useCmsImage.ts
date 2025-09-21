/**
 * Composable pour gérer les URLs d'images du CMS avec proxy
 * 
 * Au lieu d'utiliser directement : https://cms.example.com/assets/image.jpg
 * Utilisez : useCmsImage('image.jpg') qui retournera /api/cms-images/image.jpg
 * 
 * @param imagePath - Le chemin ou ID de l'image
 * @param quality - La qualité de l'image (optionnel, entre 1-100)
 */

export const useCmsImage = (imagePath: string | null | undefined, quality?: number | string): string => {
  // Si pas d'image, retourner une image par défaut
  if (!imagePath) {
    return '/images/placeholder.jpg'
  }

  // Si l'image est déjà une URL complète (commence par http ou https)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const config = useRuntimeConfig()
    const cmsUrl = config.public.cmsApiUrl || ''
    
    // Si c'est une URL du CMS, la transformer en proxy
    if (cmsUrl && imagePath.includes(cmsUrl)) {
      // Extraire le chemin après /assets/
      const assetsIndex = imagePath.indexOf('/assets/')
      if (assetsIndex !== -1) {
        const path = imagePath.substring(assetsIndex + 8) // 8 = longueur de '/assets/'
        return `/api/cms-images/${path}`
      }
    }
    // Sinon, retourner l'URL telle quelle
    return imagePath
  }

  // Si l'image commence par /, c'est déjà une URL locale
  if (imagePath.startsWith('/')) {
    return imagePath
  }

  // Sinon, c'est un chemin relatif du CMS, utiliser le proxy
  let proxyUrl = `/api/cms-images/${imagePath}`
  
  // Ajouter le paramètre de qualité si fourni
  if (quality) {
    proxyUrl += `?quality=${quality}`
  }
  
  return proxyUrl
}

/**
 * Composable pour obtenir l'URL complète d'une image du CMS (pour les meta tags)
 * 
 * @param imagePath - Le chemin ou ID de l'image
 * @param quality - La qualité de l'image (optionnel, entre 1-100)
 */
export const useCmsImageAbsolute = (imagePath: string | null | undefined, quality?: number | string): string => {
  const { siteUrl } = useSiteMetadata()
  const relativeUrl = useCmsImage(imagePath, quality)
  
  // Si c'est déjà une URL absolue
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl
  }
  
  // Construire l'URL absolue
  return `${siteUrl}${relativeUrl}`
}