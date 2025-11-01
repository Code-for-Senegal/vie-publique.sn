/**
 * Retourne la durée de cache appropriée selon l'environnement
 * En production: utilise la durée complète
 * En développement: réduit drastiquement pour faciliter le debug
 *
 * @param productionSeconds - Durée du cache en secondes pour la production
 * @param devSeconds - Durée du cache en secondes pour le développement (optionnel, par défaut 30s)
 * @returns Durée du cache en secondes
 */
export function getCacheMaxAge(productionSeconds: number, devSeconds: number = 30): number {
  return process.env.NODE_ENV === 'production' ? productionSeconds : devSeconds;
}

/**
 * Durées de cache prédéfinies (en secondes)
 */
export const CacheDuration = {
  /** 5 minutes - Données très dynamiques */
  SHORT: 5 * 60,
  /** 1 heure - Données qui changent régulièrement */
  MEDIUM: 60 * 60,
  /** 24 heures - Données quasi-statiques */
  LONG: 24 * 60 * 60,
  /** 7 jours - Données statiques */
  VERY_LONG: 7 * 24 * 60 * 60,
} as const;
