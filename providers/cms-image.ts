import { joinURL } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'

/**
 * Provider personnalisé pour gérer les images du CMS via le proxy
 * Ce provider empêche IPX de traiter les URLs du proxy
 */
export const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL } = {}) => {
  // Si l'URL contient déjà des paramètres de qualité, on la retourne directement
  if (src.includes('?quality=')) {
    // Si elle ne commence pas par /medias, on ajoute le préfixe
    if (!src.startsWith('/medias/')) {
      const base = baseURL || '/medias'
      return {
        url: joinURL(base, src)
      }
    }
    return {
      url: src
    }
  }
  
  // Si l'URL commence déjà par /medias, on la retourne directement
  if (src.startsWith('/medias/')) {
    let url = src
    // Ajouter la qualité si elle est dans les modifiers
    if (modifiers.quality) {
      url += `?quality=${modifiers.quality}`
    }
    return {
      url
    }
  }

  // Si baseURL est défini, on l'utilise, sinon utiliser la nouvelle URL SEO
  const base = baseURL || '/medias'
  
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