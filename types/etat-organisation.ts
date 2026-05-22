export interface EtatOrganisationTypeStat {
  code: string
  label: string
  count: number
}

export interface EtatOrganisationChangeSummary {
  category: string
  label: string
  count: number
}

export interface EtatOrganisationRecentChange {
  id: string
  category: string
  label: string
  description: string
  canonical_name: string | null
  slug: string | null
  has_public_page: boolean
  from_decree: string | null
  to_decree: string | null
  parent_name: string | null
  root_name: string | null
}

export interface EtatOrganisationDecreeRef {
  id: string
  numero: string
  date_publication?: string
  status?: string
}

export interface EtatOrganisationOverview {
  decree: (EtatOrganisationDecreeRef & { previous_numero?: string | null }) | null
  stats: {
    total_entities: number
    public_pages: number
    types: EtatOrganisationTypeStat[]
  }
  changes: {
    summary: EtatOrganisationChangeSummary[]
    total: number
  }
  recent_changes: EtatOrganisationRecentChange[]
}

export interface EtatOrganisationEntity {
  id: string
  snapshot_id: string
  public_slug: string
  name: string
  canonical_name: string
  has_public_page: boolean
  type_code: string
  type_label: string
  code_institution?: number | null
  // Snapshot-based parent link (reliable, no deep JOIN needed)
  parent_snapshot_id?: string | null
  // Public-entity-based parent link (for display only)
  parent_id?: string | null
  parent_name?: string | null
  // Contact fields (from public_entities)
  email?: string | null
  adresse?: string | null
  phone?: string | null
  web_site?: string | null
  reseaux_sociaux?: Record<string, string> | null
  // Direct children (populated for entite_regroupement children in detail API)
  subchildren?: EtatOrganisationEntity[]
}

export interface EtatOrganisationEntitiesResponse {
  decree: EtatOrganisationDecreeRef | null
  allDecrees: EtatOrganisationDecreeRef[]
  entities: EtatOrganisationEntity[]
}

export interface EtatOrganisationTreeNode extends EtatOrganisationEntity {
  children: EtatOrganisationTreeNode[]
}

export interface EtatOrganisationEntityHistoryItem {
  id: string
  category: string
  label: string
  description: string
  from_decree: string | null
  to_decree: string | null
  date_created?: string
}

export interface EtatOrganisationEntityDetailResponse {
  decree: EtatOrganisationDecreeRef | null
  entity: EtatOrganisationEntity
  children: EtatOrganisationEntity[]
  breadcrumb: Array<Pick<EtatOrganisationEntity, 'id' | 'public_slug' | 'name'>>
  history: EtatOrganisationEntityHistoryItem[]
}

/** Full change record used by the comparison page */
export interface EtatOrganisationChange {
  id: string
  category: string
  label: string
  description: string
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  slug: string | null
  has_public_page: boolean
  canonical_name: string | null
  root_name: string | null
  parent_name: string | null
  from_decree: string | null
  to_decree: string | null
  date_created?: string
}

export interface EtatOrganisationChangesResponse {
  from_decree: EtatOrganisationDecreeRef | null
  to_decree: EtatOrganisationDecreeRef | null
  allDecrees: EtatOrganisationDecreeRef[]
  summary: EtatOrganisationChangeSummary[]
  changes: EtatOrganisationChange[]
  total: number
  page: number
  pageSize: number
}
