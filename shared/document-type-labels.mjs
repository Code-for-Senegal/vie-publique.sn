/**
 * Libellés français des sous-types de documents (`documents.type` Directus).
 * Utilisés comme facette `category` dans l'index Typesense.
 *
 * SOURCE DE VÉRITÉ partagée entre :
 * - scripts/search-reindex.mjs (indexation)
 * - server/api/documents/index.get.ts (filtre type → category, C10)
 * ⚠️ Le node « Transform Document v2 » du workflow n8n RT en a une copie inline :
 *   toute modification ici doit y être répercutée.
 */
export const DOCUMENT_TYPE_LABELS = {
  official_journal: 'Journal Officiel',
  law: 'Loi',
  decree: 'Décret',
  decision: 'Décision',
  ministerial_order: 'Arrêté ministériel',
  government_bill: 'Projet de loi',
  bill_proposal: 'Proposition de loi',
  code: 'Code',
  audit_report: "Rapport d'audit",
  sectoral_report: 'Rapport sectoriel',
  parliament_report: 'Rapport parlementaire',
  parliamentary_report: 'Rapport parlementaire',
  annual_report: 'Rapport annuel',
  international_report: 'Rapport international',
  commission_report: 'Rapport de commission',
  budget: 'Budget',
  election: 'Élections',
  council_of_ministers: 'Conseil des ministres',
  interministerial_council: 'Conseil interministériel',
  general_policy_statement: 'Déclaration de politique générale',
  parliament_question: 'Question parlementaire',
  legal_opinion: 'Avis juridique',
  press_release: 'Communiqué',
  communique: 'Communiqué',
  public_notice: 'Note au public',
  speech: 'Discours',
  strategy: 'Stratégie',
  circular: 'Circulaire',
  uncategorized: 'Autre',
};
