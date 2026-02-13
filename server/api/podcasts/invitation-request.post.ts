import type {
  PodcastInvitationRequest,
  PodcastInvitationSocialMedia,
} from '~~/types/podcast-invitation';
import {
  validatePodcastInvitationForm,
  sanitizeForStorage,
  type PodcastInvitationFormInput,
} from '~~/server/utils/validation';
import { checkRateLimit } from '~~/server/utils/rate-limit';
import { getCmsClient } from '~~/server/utils/cms-client';
import { createItem } from '@directus/sdk';

/**
 * API POST /api/podcasts/invitation-request
 *
 * Endpoint pour soumettre une demande d'invitation au podcast.
 * Inclut validation, sanitization, et rate limiting.
 */
export default defineEventHandler(async (event) => {
  try {
    // Rate limiting: 3 requêtes par minute par IP
    checkRateLimit(event, { maxRequests: 3, windowMs: 60_000 });

    const body = await readBody<PodcastInvitationFormInput>(event);

    // Validation complète des données
    const validation = validatePodcastInvitationForm(body);

    if (!validation.isValid) {
      // Retourne le premier message d'erreur pour l'affichage
      const firstError = Object.values(validation.errors)[0];
      throw createError({
        statusCode: 400,
        statusMessage: firstError,
        data: { errors: validation.errors },
      });
    }

    // Construire l'objet social_media depuis les champs individuels
    const socialMedia: PodcastInvitationSocialMedia = {};
    if (body.twitter) socialMedia.twitter = sanitizeForStorage(body.twitter);
    if (body.linkedin) socialMedia.linkedin = sanitizeForStorage(body.linkedin);
    if (body.facebook) socialMedia.facebook = sanitizeForStorage(body.facebook);
    if (body.instagram) socialMedia.instagram = sanitizeForStorage(body.instagram);
    if (body.website) socialMedia.website = sanitizeForStorage(body.website);

    // Préparer les données sanitisées pour Directus
    const requestData: Partial<PodcastInvitationRequest> = {
      status: 'pending',
      full_name: sanitizeForStorage(body.full_name),
      email: body.email.toLowerCase().trim(),
      phone: sanitizeForStorage(body.phone) || null,
      organization: sanitizeForStorage(body.organization) || null,
      position: sanitizeForStorage(body.position) || null,
      topic_interest: sanitizeForStorage(body.topic_interest),
      expertise_area: sanitizeForStorage(body.expertise_area) || null,
      motivation: sanitizeForStorage(body.motivation),
      availability: sanitizeForStorage(body.availability) || null,
      social_media: Object.keys(socialMedia).length > 0 ? socialMedia : null,
    };

    // Envoyer à Directus via le client CMS
    const cmsClient = getCmsClient();
    const response = await cmsClient.request<PodcastInvitationRequest>(
      createItem('vp_podcast_invitation_requests', requestData)
    );

    // Log pour monitoring (sans données sensibles)
    console.log(`[Podcast Invitation] Nouvelle demande créée: ID ${response.id}`);

    return {
      success: true,
      message: 'Votre demande a été envoyée avec succès !',
      data: {
        id: response.id,
        email: response.email,
      },
    };
  } catch (error: any) {
    // Log de l'erreur pour debugging
    console.error('[Podcast Invitation] Erreur:', error.message || error);

    // Si c'est une erreur H3 (validation, rate limit), la relancer
    if (error.statusCode) {
      throw error;
    }

    // Erreur de l'API Directus
    if (error.data?.errors) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erreur lors de l\'enregistrement de votre demande',
        data: error.data,
      });
    }

    // Erreur réseau ou serveur
    throw createError({
      statusCode: 500,
      statusMessage: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    });
  }
});
