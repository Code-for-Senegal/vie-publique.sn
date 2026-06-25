/**
 * Types pour la feature "Dossiers" (pages de référence thématiques).
 *
 * Un Dossier centralise et explique un sujet public important en liant
 * plusieurs contenus existants du site (documents, actualités, podcasts/vidéos,
 * personnalités, institutions) + des blocs éditoriaux (intro, FAQ, chronologie,
 * comparatif, sources).
 *
 * La modélisation Directus correspondante est documentée dans
 * `docs/dossiers/directus-schema.md`.
 */

/** Statut de publication d'un dossier (champ standard Directus). */
export type DossierStatus = 'draft' | 'published' | 'archived';

/**
 * Type / catégorie d'un dossier (champ `type`, dropdown Directus).
 * Libellés FR, ordre d'affichage et helper : `app/config/dossiers.config.ts`.
 */
export type DossierType =
  | 'legislative'
  | 'report'
  | 'institution'
  | 'policy'
  | 'election'
  | 'reform'
  | 'public_finance'
  | 'fact_check'
  | 'guide';

/** Bloc "Principales nouveautés" (champ JSON repeater `highlights`). */
export interface DossierHighlight {
  title: string;
  description?: string;
}

/** Entrée de FAQ (champ JSON repeater `faq`). */
export interface DossierFaqItem {
  question: string;
  answer: string;
}

/** Entrée de chronologie (champ JSON repeater `timeline`). */
export interface DossierTimelineItem {
  /** Date ISO ou libellé court (ex: "2026-03-12" ou "Mars 2026"). */
  date: string;
  title: string;
  description?: string;
}

/** Ligne de comparatif ancien/nouveau (champ JSON repeater `comparison`). */
export interface DossierComparisonRow {
  label: string;
  before?: string;
  after?: string;
}

/**
 * Lien du bloc `sources` (champ JSON repeater).
 * `url` peut être un chemin interne (`/budget-senegal`) — le lien reste sur le site —
 * ou une URL externe (`https://…`) — ouverte dans un nouvel onglet.
 */
export interface DossierLink {
  label: string;
  url: string;
}

/** Référence allégée d'un document lié. */
export interface DossierLinkedDocument {
  id: string;
  title: string;
  slug: string;
  type?: string;
  publish_date?: string;
  cover_image?: string;
}

/** Référence allégée d'une actualité liée. */
export interface DossierLinkedNews {
  id: string;
  title: string;
  slug?: string;
  date_published?: string;
  cover_image?: string;
  category?: string;
}

/** Référence allégée d'un podcast / vidéo lié. */
export interface DossierLinkedPodcast {
  id: number | string;
  title: string;
  slug: string;
  youtube_video_id?: string;
  cover_image?: string;
}

/** Référence allégée d'une personnalité liée. */
export interface DossierLinkedPerson {
  id: number | string;
  full_name: string;
  slug: string;
  photo?: string;
}

/**
 * Référence allégée d'une entité publique de l'État liée
 * (ministère, agence, établissement public, institution, présidence, primature…).
 */
export interface DossierLinkedEntity {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  /** Code du type d'entité (ex. `ministere`, `institution`, `presidence`) → détermine l'URL. */
  type_code?: string;
}

/**
 * Élément de liste (page /dossiers) — champs légers pour les cartes.
 */
export interface DossierListItem {
  id: string;
  title: string;
  slug: string;
  /** Catégorie du dossier (voir DossierType). */
  type?: string;
  summary?: string;
  cover_image?: string;
  publish_date?: string;
  date_updated?: string;
  tags?: string[];
  featured?: boolean;
}

/**
 * Dossier complet (page /dossiers/[slug]) — inclut le contenu riche
 * et toutes les relations résolues.
 */
export interface Dossier extends DossierListItem {
  status?: DossierStatus;
  /** Introduction éditoriale (HTML WYSIWYG). */
  intro_html?: string;
  /** Contenu riche principal (HTML WYSIWYG). */
  content_html?: string;
  seo_title?: string;
  seo_description?: string;
  date_created?: string;

  // Blocs éditoriaux optionnels
  highlights?: DossierHighlight[];
  faq?: DossierFaqItem[];
  timeline?: DossierTimelineItem[];
  comparison?: DossierComparisonRow[];
  /** Liens (internes `/…` ou externes `https://…`) — sources & ressources. */
  sources?: DossierLink[];

  // Relations résolues
  documents?: DossierLinkedDocument[];
  news?: DossierLinkedNews[];
  podcasts?: DossierLinkedPodcast[];
  public_persons?: DossierLinkedPerson[];
  /** Entités publiques liées (ministères, agences, institutions…). */
  public_entities?: DossierLinkedEntity[];
}
