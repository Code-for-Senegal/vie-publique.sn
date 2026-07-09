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

  // Si l'image est déjà une URL externe complète (http/https), retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Si l'image commence par /, c'est déjà une URL locale
  if (imagePath.startsWith('/')) {
    return imagePath
  }

  // Sinon, c'est un ID du CMS, transformer en URL proxy SEO-friendly
  // SVG et GIF : pas de conversion de format (SVG serait rasterisé, GIF perdrait l'animation)
  const ext = imagePath.split('.').pop()?.toLowerCase()
  if (ext === 'svg' || ext === 'gif') {
    return `/cms/${imagePath}`
  }
  // format=webp + quality par défaut — Directus les applique via Sharp
  const q = quality || 80
  return `/cms/${imagePath}?format=webp&quality=${q}`
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