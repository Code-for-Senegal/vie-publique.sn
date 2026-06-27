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
  | 'ministerial_order'
  | 'decision'
  | 'legal_opinion'
  | 'circular'
  | 'statistical_survey';

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
  decision: 'Décision',
  legal_opinion: 'Avis',
  circular: 'Circulaire',
  statistical_survey: 'Enquête statistique',
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

/**
 * Pages dédiées par organisme de contrôle (SEO).
 *
 * Chaque organisme a une page indexable propre :
 *   /documents/rapports-audit/organisme/<slug>
 * (cible des requêtes « rapport <organisme> sénégal »).
 *
 * `institution` = valeur exacte du champ Directus `audit_institution`
 * (sert au filtre serveur). Importé à la fois côté page et côté sitemap.
 */
export interface AuditInstitutionPage {
  /** Slug d'URL, sans accent (ex: 'cour-des-comptes') */
  slug: string;
  /** Valeur du champ `audit_institution` pour le filtre */
  institution: AuditInstitution;
  /** Sigle / nom court (ex: 'OFNAC') */
  name: string;
  /** Nom complet de l'institution */
  fullName: string;
  /** <title> de la page (sans la marque — titleTemplate l'ajoute) */
  seoTitle: string;
  /** meta description */
  description: string;
  /** Paragraphe éditorial affiché en tête de page (clé pour le ranking) */
  intro: string;
}

export const AUDIT_INSTITUTION_PAGES: AuditInstitutionPage[] = [
  {
    slug: 'cour-des-comptes',
    institution: 'Cour des Comptes',
    name: 'Cour des Comptes',
    fullName: 'Cour des comptes du Sénégal',
    seoTitle: 'Rapports de la Cour des Comptes du Sénégal',
    description:
      'Tous les rapports de la Cour des comptes du Sénégal : rapport annuel sur l’exécution des lois de finances, rapports particuliers et déclarations de conformité.',
    intro:
      'La Cour des comptes est l’institution supérieure de contrôle des finances publiques du Sénégal. Elle juge les comptes des comptables publics, contrôle l’exécution des lois de finances et la gestion des organismes publics, et publie chaque année un rapport public ainsi que des rapports particuliers. Retrouvez ici ses rapports rendus accessibles aux citoyens.',
  },
  {
    slug: 'ofnac',
    institution: 'OFNAC',
    name: 'OFNAC',
    fullName: 'Office National de lutte contre la Fraude et la Corruption',
    seoTitle: 'Rapports de l’OFNAC du Sénégal',
    description:
      'Rapports d’activités de l’OFNAC (Office National de lutte contre la Fraude et la Corruption) du Sénégal : plaintes, enquêtes, prévention et déclarations de patrimoine.',
    intro:
      'L’OFNAC (Office National de lutte contre la Fraude et la Corruption) est une autorité administrative indépendante chargée de prévenir et combattre la fraude et la corruption au Sénégal. Il reçoit les plaintes et dénonciations, mène des enquêtes et gère les déclarations de patrimoine. Consultez ici ses rapports d’activités.',
  },
  {
    slug: 'ige',
    institution: 'IGE',
    name: 'IGE',
    fullName: 'Inspection générale d’État',
    seoTitle: 'Rapports de l’Inspection générale d’État (IGE) du Sénégal',
    description:
      'Rapports publics de l’Inspection générale d’État (IGE) du Sénégal sur la gouvernance, la reddition des comptes et le contrôle de l’administration.',
    intro:
      'L’Inspection générale d’État (IGE) est l’organe supérieur de contrôle de l’administration publique, placé sous l’autorité directe du Président de la République. Elle vérifie la gestion administrative et financière des services de l’État et publie des rapports publics sur l’état de la gouvernance et la reddition des comptes. Retrouvez ici ses rapports déclassifiés.',
  },
  {
    slug: 'centif',
    institution: 'CENTIF',
    name: 'CENTIF',
    fullName: 'Cellule nationale de Traitement des Informations Financières',
    seoTitle: 'Rapports de la CENTIF du Sénégal',
    description:
      'Rapports annuels d’activité de la CENTIF (Cellule nationale de Traitement des Informations Financières) du Sénégal : lutte contre le blanchiment de capitaux et le financement du terrorisme.',
    intro:
      'La CENTIF (Cellule nationale de Traitement des Informations Financières) est l’organisme chargé de lutter contre le blanchiment de capitaux et le financement du terrorisme au Sénégal. Elle reçoit et analyse les déclarations de soupçon et publie un rapport annuel d’activité. Consultez ici ses rapports.',
  },
  {
    slug: 'armp',
    institution: 'ARMP',
    name: 'ARMP',
    fullName: 'Autorité de Régulation de la Commande publique',
    seoTitle: 'Rapports de l’ARMP du Sénégal — Marchés publics',
    description:
      'Rapports et audits de l’ARMP (Autorité de Régulation de la Commande publique) du Sénégal sur la passation et l’exécution des marchés publics.',
    intro:
      'L’ARMP (Autorité de Régulation de la Commande publique, anciennement Autorité de Régulation des Marchés Publics) veille à la transparence et à l’efficacité de la commande publique au Sénégal. Elle réalise des audits indépendants des marchés publics et publie des rapports annuels. Retrouvez ici ses rapports.',
  },
];

/** Recherche d'une page organisme par slug d'URL */
export const getAuditInstitutionPage = (slug: string): AuditInstitutionPage | undefined =>
  AUDIT_INSTITUTION_PAGES.find((o) => o.slug === slug);

export interface Document {
  id: string;
  title: string;
  slug: string;
  type: string;
  publish_date: string;
  date_created?: string;
  date_updated?: string;
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
