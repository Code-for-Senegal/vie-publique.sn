// === Mode dashboard ===
export type PublicProjectMode = 'global' | 'pres' | 'pip';

// === Projet public - élément liste (tableau dashboard) ===
export interface PublicProject {
  id: number;
  title: string;
  shortTitle: string | null;
  slug: string;
  code: string | null;
  summary: string | null;
  isInPres: boolean;
  isInPip: boolean;
  isPriority: boolean;
  budgetTotalAmount: number | null;
  startYear: number | null;
  endYear: number | null;
  currentStatusLabel: string | null;
  currentDelayStatusLabel: string | null;
  currentProgramLabel: string | null;
  regionPrimaryLabel: string | null;
  sourceLabel: string | null;
  sector: { id: number; name: string; color: string | null; icon: string | null } | null;
  ministry: { id: number; name: string; publicSlug: string | null } | null;
  policyPrimary: { id: number; title: string } | null;
  // Budget annuel pour l'année sélectionnée (jointure optionnelle)
  annualAE: number | null;
  annualCP: number | null;
}

// === Projet public - page détail ===
export interface PublicProjectDetail extends PublicProject {
  description: string | null;
  documentPrimary: PublicProjectDocument | null;
  documents: PublicProjectDocument[];
  policies: { id: number; title: string; slug: string }[];
  locations: PublicProjectLocation[];
  yearLabel: string | null;
  versionLabel: string | null;
  yearLabelAmountAE: string | null;
  yearLabelAmountCP: string | null;
  linkWebsite: string | null;
  linkFacebook: string | null;
  linkLinkedin: string | null;
  linkTwitter: string | null;
}

export interface PublicProjectDocument {
  id: string;
  title: string;
  slug: string;
  file: string | null;
  coverImage: string | null;
}

export interface PublicProjectLocation {
  id: number;
  [key: string]: any;
}

// === Budget annuel projet ===
export interface PublicProjectBudgetYear {
  id: number;
  year: number;
  yearLabel: string;
  version: string;
  versionLabel: string;
  amount: number | null;
  amountAE: number | null;
  amountCP: number | null;
  sourceDocument: PublicProjectDocument | null;
}

// === Secteur ===
export interface PublicProjectSector {
  id: number;
  name: string;
  slug: string;
  code: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number | null;
}

// === Politique publique (pour filtre) ===
export interface PublicPolicy {
  id: number;
  title: string;
  slug: string;
  policyType: string | null;
  code: string | null;
}

// === KPI Dashboard ===
export interface PublicProjectStats {
  totalProjects: number;
  totalPres: number;
  totalPip: number;
  totalPriority: number;
  totalMinistries: number;
  totalSectors: number;
  totalBudget: number | null;
  totalAE: number | null;
  totalCP: number | null;
  year: number | null;
  versionLabel: string | null;
}

// === Options de filtres disponibles ===
export interface PublicProjectFilters {
  sectors: PublicProjectSector[];
  policies: PublicPolicy[];
  years: { year: number; yearId: number }[];
  versions: { id: number; label: string; yearId: number }[];
  ministries: { id: number; name: string }[];
  regions: string[];
}

// === Réponse paginée ===
export interface PublicProjectListResponse {
  projects: PublicProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Réponse détail ===
export interface PublicProjectDetailResponse {
  project: PublicProjectDetail;
  budgetYears: PublicProjectBudgetYear[];
}
