/**
 * Génère un slug SEO-friendly à partir d'un nom
 * @param name - Le nom à convertir en slug
 * @returns Le slug normalisé
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Supprimer les tirets au début et à la fin
}
