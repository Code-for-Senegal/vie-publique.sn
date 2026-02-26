import { joinURL } from 'ufo'
import type { ProviderGetImage } from '@nuxt/image'

/**
 * Provider personnalisé pour gérer les images du CMS via le proxy.
 * Empêche IPX de traiter les URLs du proxy et transmet les transforms Directus
 * (quality, width, height) directement dans la query string.
 */
export const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL } = {}) => {
  // Construire les query params Directus à partir des modifiers NuxtImg
  const params: string[] = []
  if (modifiers.width) params.push(`width=${modifiers.width}`)
  if (modifiers.height) params.push(`height=${modifiers.height}`)
  if (modifiers.quality) params.push(`quality=${modifiers.quality}`)
  const queryString = params.length ? `?${params.join('&')}` : ''

  // Si l'URL commence déjà par /cms/, on la retourne avec les params
  if (src.startsWith('/cms/')) {
    // Retirer les anciens query params s'il y en a déjà
    const cleanSrc = src.split('?')[0]
    return { url: `${cleanSrc}${queryString}` }
  }

  // Sinon on construit l'URL avec le préfixe /cms
  const base = baseURL || '/cms'
  // Retirer les anciens query params s'il y en a déjà
  const cleanSrc = src.split('?')[0]
  const url = joinURL(base, cleanSrc)

  return { url: `${url}${queryString}` }
}
