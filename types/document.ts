// Types de documents disponibles
export type DocumentType =
  | 'official_journal'
  | 'budget'
  | 'audit_report'
  | 'code'
  | 'council_of_ministers'
  | 'strategy'
  | 'government_bill'
  | 'bill_proposal'
  | 'speech'
  | 'decree'
  | 'interministerial_council'
  | 'communique'
  | 'international_report'
  | 'law'
  | 'uncategorized'
  | 'general_policy_statement'
  | 'parliament_report'
  | 'parliament_question'
  | 'public_notice'
  | 'press_release'
  | 'election'
  | 'annual_report'
  | 'parliamentary_report'
  | 'sectoral_report'
  | 'ministerial_order';

// Mapping type → label français
export const DOC_TYPE_LABELS: Record<string, string> = {
  official_journal: 'Journal officiel',
  law: 'Loi',
  decree: 'Décret',
  ministerial_order: 'Arrêté ministériel',
  audit_report: "Rapport d'audit",
  annual_report: 'Rapport activité annuel',
  sectoral_report: 'Rapport sectoriel',
  code: 'Codes généraux',
  budget: 'Documents budget',
  council_of_ministers: 'Conseil des ministres',
  strategy: 'Stratégies',
  government_bill: 'Projet de loi',
  bill_proposal: 'Proposition de loi',
  speech: 'Discours',
  interministerial_council: 'Conseil interministériel',
  communique: 'Communiqué',
  international_report: 'Rapport international',
  uncategorized: 'Non catégorisé',
  public_notice: 'Note au public',
  parliament_question: 'Question Député',
  parliament_report: 'Rapport parlementaire',
  general_policy_statement: 'Déclaration de politique générale',
  press_release: 'Communiqué de presse',
  election: 'Élection',
  parliamentary_report: 'Rapport parlementaire',
};

// Familles de documents
export type DocumentFamily =
  | 'legislation'
  | 'budget'
  | 'strategy'
  | 'accountability'
  | 'statistics'
  | 'parliament'
  | 'communication'
  | 'election'
  | 'archives'
  | 'international';

// Mapping famille → label français
export const DOC_FAMILY_LABELS: Record<string, string> = {
  legislation: 'Législation',
  budget: 'Budget',
  strategy: 'Stratégie',
  accountability: 'Rapports publics',
  statistics: 'Statistique',
  parliament: 'Parlementaire',
  communication: 'Communiqués',
  election: 'Élection',
  archives: 'Archives',
  international: 'International',
};

// Organismes d'audit (pour filtrage des rapports d'audit)
export const AUDIT_INSTITUTIONS = ['Cour des Comptes', 'OFNAC', 'CENTIF', 'IGE', 'ARMP'] as const;

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
  family?: string;
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
