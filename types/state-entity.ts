/**
 * Types pour l'annuaire des entités publiques du Sénégal
 * Basé sur la collection Directus 'state_entities'
 */

/**
 * Type d'entité publique (codes utilisés dans state_type)
 */
export type StateEntityType =
  | 'ministry'
  | 'agency'
  | 'directorate'
  | 'public_institution'
  | 'state_owned_enterprise'
  | 'presidency'
  | 'primature'
  | 'service'
  | 'other';

/**
 * Statut d'une entité publique (DEPRECATED - pas utilisé dans le nouveau modèle)
 */
export type StateEntityStatus = 'active' | 'inactive' | 'dissolved' | 'merged' | 'renamed';

/**
 * Entité publique du Sénégal
 */
export interface StateEntity {
  id: string;
  public_slug: string;
  name: string;
  slug: string;
  has_public_page: boolean;
  type: string | number; // ID de la relation vers state_type
  type_info?: { code: string; label: string }; // Infos enrichies depuis state_type
  business_key?: string;
  last_decree_reference?: string;

  // Relations hiérarchiques (via state_structure)
  parent_entity?: { id: string; name: string; public_slug: string } | null;

  // Relations calculées (côté client)
  children?: StateEntity[];
  children_count?: number;
  level?: number;
}

/**
 * Événement historique d'une entité
 */
export interface StateEntityEvent {
  id: number;
  entity_id: number;
  event_type: 'created' | 'renamed' | 'merged' | 'dissolved' | 'moved' | 'other';
  event_date: string;
  description: string;
  legal_reference?: string;
  decree_number?: string;
  old_name?: string;
  new_name?: string;
  old_parent?: number | StateEntity;
  new_parent?: number | StateEntity;
  date_created?: string;
}

/**
 * Filtres pour la liste des entités
 */
export interface StateEntityFilters {
  search?: string;
  type?: StateEntityType;
  parent_id?: string | null;
  has_children?: boolean;
  page?: number;
  limit?: number;
  sort?: string[];
}

/**
 * Réponse paginée de la liste des entités
 */
export interface StateEntityListResponse {
  data: StateEntity[];
  meta: {
    total_count: number;
    filter_count: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Réponse détaillée d'une entité avec historique et relations
 */
export interface StateEntityDetailResponse {
  entity: StateEntity;
  children: StateEntity[];
  history: StateEntityEvent[];
  breadcrumb: StateEntity[];
}

/**
 * Noeud d'arbre hiérarchique
 */
export interface StateEntityTreeNode extends StateEntity {
  children: StateEntityTreeNode[];
  level: number;
}

/**
 * Statistiques des entités
 */
export interface StateEntityStats {
  total: number;
}
