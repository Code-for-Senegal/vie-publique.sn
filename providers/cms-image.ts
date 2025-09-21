import { joinURL } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'

/**
 * Provider personnalisé pour gérer les images du CMS via le proxy
 * Ce provider empêche IPX de traiter les URLs du proxy
 */
export const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL } = {}) => {
  // Si l'URL contient déjà des paramètres de qualité, on la retourne directement
  if (src.includes('?quality=')) {
    // Si elle ne commence pas par /api/cms-images, on ajoute le préfixe
    if (!src.startsWith('/api/cms-images/')) {
      const base = baseURL || '/api/cms-images'
      return {
        url: joinURL(base, src)
      }
    }
    return {
      url: src
    }
  }
  
  // Si l'URL commence déjà par /api/cms-images, on la retourne directement
  if (src.startsWith('/api/cms-images/')) {
    let url = src
    // Ajouter la qualité si elle est dans les modifiers
    if (modifiers.quality) {
      url += `?quality=${modifiers.quality}`
    }
    return {
      url
    }
  }

  // Si baseURL est défini, on l'utilise
  const base = baseURL || '/api/cms-images'
  
  // Construction de l'URL avec les modificateurs si nécessaire
  let url = joinURL(base, src)
  
  // Ajout des paramètres de transformation si présents
  if (modifiers.quality) {
    url += `?quality=${modifiers.quality}`
  }

  return {
    url
  }
}