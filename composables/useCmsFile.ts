/**
 * Composable pour gérer les URLs de fichiers du CMS avec proxy
 * 
 * Au lieu d'utiliser directement : https://cms.example.com/assets/document.pdf
 * Utilisez : useCmsFile('document.pdf') qui retournera /api/cms-files/document.pdf
 * 
 * @param filePath - Le chemin ou ID du fichier
 */

export const useCmsFile = (filePath: string | null | undefined): string => {
  // Si pas de fichier, retourner une URL vide
  if (!filePath) {
    return ''
  }

  // Si le fichier est déjà une URL complète (commence par http ou https)
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    const config = useRuntimeConfig()
    const cmsUrl = config.public.cmsApiUrl || ''
    
    // Si c'est une URL du CMS, la transformer en proxy
    if (cmsUrl && filePath.includes(cmsUrl)) {
      // Extraire le chemin après /assets/
      const assetsIndex = filePath.indexOf('/assets/')
      if (assetsIndex !== -1) {
        const path = filePath.substring(assetsIndex + 8) // 8 = longueur de '/assets/'
        return `/documents/${path}`
      }
    }
    // Sinon, retourner l'URL telle quelle
    return filePath
  }

  // Si le fichier commence par /, c'est déjà une URL locale
  if (filePath.startsWith('/')) {
    return filePath
  }

  // Sinon, c'est un chemin relatif du CMS, utiliser le proxy SEO-friendly
  return `/documents/${filePath}`
}

/**
 * Composable pour obtenir l'URL complète d'un fichier du CMS (pour les meta tags)
 * 
 * @param filePath - Le chemin ou ID du fichier
 */
export const useCmsFileAbsolute = (filePath: string | null | undefined): string => {
  const { siteUrl } = useSiteMetadata()
  const relativeUrl = useCmsFile(filePath)
  
  // Si c'est déjà une URL absolue
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl
  }
  
  // Si pas de fichier
  if (!relativeUrl) {
    return ''
  }
  
  // Construire l'URL absolue
  return `${siteUrl}${relativeUrl}`
}

/**
 * Fonction pour ouvrir un fichier CMS dans un nouvel onglet
 * 
 * @param filePath - Le chemin ou ID du fichier
 * @param filename - Nom optionnel du fichier pour le titre de l'onglet
 */
export const openCmsFile = (filePath: string | null | undefined, filename?: string): void => {
  const fileUrl = useCmsFile(filePath)
  
  if (fileUrl) {
    const newWindow = window.open(fileUrl, '_blank')
    
    // Optionnel : changer le titre de l'onglet si un nom de fichier est fourni
    if (newWindow && filename) {
      newWindow.addEventListener('load', () => {
        if (newWindow.document) {
          newWindow.document.title = filename
        }
      })
    }
  }
}

/**
 * Fonction pour télécharger un fichier CMS
 * 
 * @param filePath - Le chemin ou ID du fichier
 * @param filename - Nom optionnel du fichier pour le téléchargement
 */
export const downloadCmsFile = (filePath: string | null | undefined, filename?: string): void => {
  const fileUrl = useCmsFile(filePath)
  
  if (fileUrl) {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = filename || filePath?.split('/').pop() || 'document'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}