import type { DossierType } from '~~/types/dossier';

/**
 * Configuration runtime de la feature Dossiers (libellés des catégories).
 *
 * Les **clés** doivent correspondre EXACTEMENT aux valeurs du dropdown `type`
 * de la collection Directus `dossiers` (voir `docs/dossiers/directus-schema.md`).
 */

/** Libellés FR des types de dossier (clé = valeur stockée dans Directus). */
export const DOSSIER_TYPE_LABELS: Record<string, string> = {
  legislative: 'Législatif',
  report: 'Rapport',
  institution: 'Institution',
  policy: 'Politique publique',
  election: 'Élection',
  reform: 'Réforme',
  public_finance: 'Finances publiques',
  fact_check: 'Fact-check',
  guide: 'Guide',
};

/** Ordre d'affichage des filtres par catégorie sur la page /dossiers. */
export const DOSSIER_TYPE_ORDER: DossierType[] = [
  'legislative',
  'reform',
  'policy',
  'public_finance',
  'institution',
  'election',
  'report',
  'fact_check',
  'guide',
];

/** Libellé FR d'un type (fallback : la valeur brute). */
export const dossierTypeLabel = (type?: string): string =>
  (type && DOSSIER_TYPE_LABELS[type]) || type || '';
