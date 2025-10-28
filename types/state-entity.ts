/**
 * Types pour l'annuaire des entités publiques du Sénégal
 * Basé sur la collection Directus 'state_entities'
 */

/**
 * Type d'entité publique
 */
export type StateEntityType =
  | 'ministere'
  | 'secretariat_etat'
  | 'direction'
  | 'agence'
  | 'autorite'
  | 'societe_nationale'
  | 'etablissement'
  | 'commission'
  | 'conseil'
  | 'autre';

/**
 * Statut d'une entité publique
 */
export type StateEntityStatus = 'active' | 'inactive' | 'dissolved' | 'merged' | 'renamed';

/**
 * Entité publique du Sénégal
 */
export interface StateEntity {
  id: number;
  public_slug: string;
  name: string;
  short_name?: string;
  acronym?: string;
  type: StateEntityType;
  status: StateEntityStatus;
  description?: string;
  mission?: string;

  // Relations hiérarchiques
  parent_entity?: number | StateEntity | null;

  // Informations de contact
  address?: string;
  phone?: string;
  email?: string;
  website?: string;

  // Responsables
  director_name?: string;
  director_title?: string;

  // Dates
  created_at?: string;
  dissolved_at?: string;

  // Référence légale
  legal_reference?: string;
  decree_number?: string;
  decree_date?: string;

  // Métadonnées
  date_created?: string;
  date_updated?: string;

  // Relations calculées (côté client)
  children?: StateEntity[];
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
  status?: StateEntityStatus;
  parent_id?: number | null;
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
  by_type: Record<StateEntityType, number>;
  by_status: Record<StateEntityStatus, number>;
  active_ministries: number;
  total_agencies: number;
  total_directions: number;
}
