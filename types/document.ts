// Types de documents disponibles
export type DocumentType =
  | 'official_journal'
  | 'budget'
  | 'audit_report'
  | 'code'
  | 'council_of_ministers'
  | 'strategy'
  | 'government_bill'
  | 'speech'
  | 'decree'
  | 'interministerial_council'
  | 'communique'
  | 'international_report'
  | 'law'
  | 'uncategorized';

// Mapping type → label français
export const DOC_TYPE_LABELS: Record<string, string> = {
  official_journal: 'Journal officiel',
  audit_report: "Rapport d'audit",
  budget: 'Documents budget',
  code: 'Codes généraux',
  council_of_ministers: 'Conseil des ministres',
  strategy: 'Stratégies',
  government_bill: 'Projet de loi',
  speech: 'Discours',
  decree: 'Décret',
  interministerial_council: 'Conseil interministériel',
  communique: 'Communiqué',
  international_report: 'Rapport international',
  uncategorized: 'Non catégorisé',
  law: 'Loi',
};

// Organismes d'audit (pour filtrage des rapports d'audit)
export const AUDIT_INSTITUTIONS = [
  'Cour des Comptes',
  'OFNAC',
  'CENTIF',
  'IGE',
  'ARMP',
] as const;

export type AuditInstitution = (typeof AUDIT_INSTITUTIONS)[number];

export interface Document {
  id: string;
  title: string;
  slug: string;
  type: string;
  publish_date: string;
  date_created?: string;
  description?: string;
  audit_institution?: string;
  cover_image?: string;
  jo_number?: string;
  jo_type?: string;
  content_html?: string;
  file?: {
    id: string;
    type: string;
    filesize: string;
    filename_download: string;
  };
  tags?: string[];
}
