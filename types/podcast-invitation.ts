/**
 * Types pour les demandes d'invitation au podcast Vie Publique Sénégal
 */

/**
 * Statuts possibles d'une demande d'invitation
 */
export type PodcastInvitationStatus =
  | 'draft'
  | 'pending'
  | 'reviewed'
  | 'accepted'
  | 'rejected'
  | 'archived';

/**
 * Structure des réseaux sociaux pour la demande
 */
export interface PodcastInvitationSocialMedia {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

/**
 * Demande d'invitation stockée dans le CMS
 */
export interface PodcastInvitationRequest {
  id?: number;
  status?: PodcastInvitationStatus;
  full_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  position?: string | null;
  topic_interest: string;
  expertise_area?: string | null;
  motivation: string;
  availability?: string | null;
  social_media?: PodcastInvitationSocialMedia | null;
  admin_notes?: string | null;
  date_created?: string;
  date_updated?: string;
}

/**
 * Données du formulaire côté frontend (tous les champs sont des strings)
 */
export interface PodcastInvitationFormData {
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  topic_interest: string;
  expertise_area: string;
  motivation: string;
  availability: string;
  twitter: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  website: string;
}

/**
 * Réponse de l'API après soumission réussie
 */
export interface PodcastInvitationApiResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
  };
}

/**
 * État du formulaire d'invitation (pour le composable)
 */
export interface PodcastInvitationFormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: Record<string, string>;
  globalError: string;
}

/**
 * Limites de caractères pour les champs du formulaire
 */
export const PODCAST_INVITATION_FIELD_LIMITS = {
  fullName: { min: 2, max: 100 },
  email: { min: 5, max: 255 },
  phone: { min: 8, max: 20 },
  organization: { max: 200 },
  position: { max: 150 },
  topicInterest: { min: 20, max: 2000 },
  expertiseArea: { max: 1000 },
  motivation: { min: 30, max: 3000 },
  availability: { max: 500 },
  socialHandle: { max: 200 },
  website: { max: 500 },
} as const;

/**
 * Valeurs initiales du formulaire
 */
export const PODCAST_INVITATION_INITIAL_FORM: PodcastInvitationFormData = {
  full_name: '',
  email: '',
  phone: '',
  organization: '',
  position: '',
  topic_interest: '',
  expertise_area: '',
  motivation: '',
  availability: '',
  twitter: '',
  linkedin: '',
  facebook: '',
  instagram: '',
  website: '',
};
