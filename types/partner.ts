/**
 * Type pour les partenaires provenant de Directus (vp_partners)
 */
export interface Partner {
  id: number;
  name: string;
  logo: string;
  website: string;
  status?: string;
  date_created?: string;
  date_updated?: string;
}

/**
 * Réponse de l'API Directus pour les partenaires
 */
export interface PartnersResponse {
  data: Partner[];
}
