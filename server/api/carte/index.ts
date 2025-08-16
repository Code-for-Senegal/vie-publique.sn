import { defineEventHandler } from 'h3'

// Cache de 1 heure pour les données de carte
const CACHE_TTL = 3600 * 1000; // 1 heure en millisecondes

let cachedData: any = null;
let cacheTimestamp = 0;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  // Vérifier si le cache est encore valide
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedData;
  }
  
  try {
    // Appel API vers le CMS
    const response = await $fetch(`${config.public.cmsApiUrl}/items/carte`, {
      headers: {
        Authorization: `Bearer ${config.public.cmsApiKey}`,
      },
    });
    
    // Mettre en cache
    cachedData = response;
    cacheTimestamp = now;
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de carte:', error);
    
    // Retourner le cache même expiré en cas d'erreur
    if (cachedData) {
      return cachedData;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des données de carte'
    });
  }
});