import type {
  PodcastInvitationFormData,
  PodcastInvitationApiResponse,
} from '~~/types/podcast-invitation';
import {
  PODCAST_INVITATION_INITIAL_FORM,
  PODCAST_INVITATION_FIELD_LIMITS,
} from '~~/types/podcast-invitation';

/**
 * Règles de validation pour le formulaire d'invitation au podcast
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+221|00221)?[\s.-]?(7[0-8]|76|77|78|33)[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}$|^(\+|00)?[1-9]\d{6,14}$/;
const TWITTER_REGEX = /^@?[a-zA-Z0-9_]{1,15}$/;
const INSTAGRAM_REGEX = /^@?[a-zA-Z0-9._]{1,30}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Composable pour gérer le formulaire de demande d'invitation au podcast
 *
 * @example
 * const {
 *   formData,
 *   errors,
 *   isSubmitting,
 *   isSuccess,
 *   globalError,
 *   validateField,
 *   validateForm,
 *   submitForm,
 *   resetForm,
 * } = usePodcastInvitation();
 */
export const usePodcastInvitation = () => {
  // État du formulaire
  const formData = ref<PodcastInvitationFormData>({ ...PODCAST_INVITATION_INITIAL_FORM });

  // État de validation
  const errors = ref<Record<string, string>>({});
  const touched = ref<Record<string, boolean>>({});

  // État de soumission
  const isSubmitting = ref(false);
  const isSuccess = ref(false);
  const globalError = ref('');

  /**
   * Valide un champ spécifique
   */
  const validateField = (fieldName: keyof PodcastInvitationFormData): boolean => {
    const value = formData.value[fieldName];
    const limits = PODCAST_INVITATION_FIELD_LIMITS;

    // Supprimer l'erreur existante
    delete errors.value[fieldName];

    switch (fieldName) {
      case 'full_name':
        if (!value?.trim()) {
          errors.value[fieldName] = 'Le nom complet est requis';
        } else if (value.trim().length < limits.fullName.min) {
          errors.value[fieldName] = `Le nom doit contenir au moins ${limits.fullName.min} caractères`;
        } else if (value.trim().length > limits.fullName.max) {
          errors.value[fieldName] = `Le nom ne doit pas dépasser ${limits.fullName.max} caractères`;
        }
        break;

      case 'email':
        if (!value?.trim()) {
          errors.value[fieldName] = "L'email est requis";
        } else if (!EMAIL_REGEX.test(value.trim())) {
          errors.value[fieldName] = 'Adresse email invalide';
        }
        break;

      case 'phone':
        if (value && !PHONE_REGEX.test(value.replace(/[\s.-]/g, ''))) {
          errors.value[fieldName] = 'Numéro de téléphone invalide';
        }
        break;

      case 'organization':
        if (value && value.length > limits.organization.max) {
          errors.value[fieldName] = `L'organisation ne doit pas dépasser ${limits.organization.max} caractères`;
        }
        break;

      case 'position':
        if (value && value.length > limits.position.max) {
          errors.value[fieldName] = `Le poste ne doit pas dépasser ${limits.position.max} caractères`;
        }
        break;

      case 'topic_interest':
        if (!value?.trim()) {
          errors.value[fieldName] = 'Le sujet est requis';
        } else if (value.trim().length < limits.topicInterest.min) {
          errors.value[fieldName] = `Le sujet doit contenir au moins ${limits.topicInterest.min} caractères`;
        } else if (value.trim().length > limits.topicInterest.max) {
          errors.value[fieldName] = `Le sujet ne doit pas dépasser ${limits.topicInterest.max} caractères`;
        }
        break;

      case 'expertise_area':
        if (value && value.length > limits.expertiseArea.max) {
          errors.value[fieldName] = `Le domaine d'expertise ne doit pas dépasser ${limits.expertiseArea.max} caractères`;
        }
        break;

      case 'motivation':
        if (!value?.trim()) {
          errors.value[fieldName] = 'La motivation est requise';
        } else if (value.trim().length < limits.motivation.min) {
          errors.value[fieldName] = `La motivation doit contenir au moins ${limits.motivation.min} caractères`;
        } else if (value.trim().length > limits.motivation.max) {
          errors.value[fieldName] = `La motivation ne doit pas dépasser ${limits.motivation.max} caractères`;
        }
        break;

      case 'availability':
        if (value && value.length > limits.availability.max) {
          errors.value[fieldName] = `La disponibilité ne doit pas dépasser ${limits.availability.max} caractères`;
        }
        break;

      case 'twitter':
        if (value && !TWITTER_REGEX.test(value.trim())) {
          errors.value[fieldName] = 'Identifiant Twitter/X invalide (ex: @username)';
        }
        break;

      case 'linkedin':
        // Accepte les URLs complètes ou les usernames
        if (value && value.length > limits.socialHandle.max) {
          errors.value[fieldName] = 'URL LinkedIn trop longue';
        }
        break;

      case 'facebook':
        if (value && value.length > limits.socialHandle.max) {
          errors.value[fieldName] = 'URL Facebook trop longue';
        }
        break;

      case 'instagram':
        if (value && !INSTAGRAM_REGEX.test(value.trim())) {
          errors.value[fieldName] = 'Identifiant Instagram invalide (ex: @username)';
        }
        break;

      case 'website':
        if (value && !URL_REGEX.test(value.trim())) {
          errors.value[fieldName] = 'URL invalide (doit commencer par http:// ou https://)';
        } else if (value && value.length > limits.website.max) {
          errors.value[fieldName] = 'URL trop longue';
        }
        break;
    }

    return !errors.value[fieldName];
  };

  /**
   * Marque un champ comme touché et le valide
   */
  const handleBlur = (fieldName: keyof PodcastInvitationFormData) => {
    touched.value[fieldName] = true;
    validateField(fieldName);
  };

  /**
   * Valide tout le formulaire
   */
  const validateForm = (): boolean => {
    const fields: (keyof PodcastInvitationFormData)[] = [
      'full_name',
      'email',
      'phone',
      'organization',
      'position',
      'topic_interest',
      'expertise_area',
      'motivation',
      'availability',
      'twitter',
      'linkedin',
      'facebook',
      'instagram',
      'website',
    ];

    // Marquer tous les champs comme touchés
    fields.forEach(field => {
      touched.value[field] = true;
    });

    // Valider tous les champs
    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  };

  /**
   * Vérifie si le formulaire est valide pour soumission (champs requis remplis)
   */
  const canSubmit = computed(() => {
    const { full_name, email, topic_interest, motivation } = formData.value;
    return (
      full_name?.trim() &&
      email?.trim() &&
      topic_interest?.trim() &&
      motivation?.trim() &&
      Object.keys(errors.value).length === 0 &&
      !isSubmitting.value
    );
  });

  /**
   * Compte les caractères restants pour un champ
   */
  const getCharacterCount = (
    fieldName: keyof PodcastInvitationFormData,
    maxLength: number
  ): { current: number; max: number; remaining: number } => {
    const current = formData.value[fieldName]?.length || 0;
    return {
      current,
      max: maxLength,
      remaining: maxLength - current,
    };
  };

  /**
   * Soumet le formulaire
   */
  const submitForm = async (): Promise<boolean> => {
    globalError.value = '';

    // Valider le formulaire
    if (!validateForm()) {
      globalError.value = 'Veuillez corriger les erreurs dans le formulaire';
      return false;
    }

    isSubmitting.value = true;

    try {
      const response = await $fetch<PodcastInvitationApiResponse>(
        '/api/podcasts/invitation-request',
        {
          method: 'POST',
          body: formData.value,
        }
      );

      if (response.success) {
        isSuccess.value = true;
        return true;
      } else {
        globalError.value = response.message || 'Une erreur est survenue';
        return false;
      }
    } catch (error: any) {

      // Erreurs de validation du serveur
      if (error.data?.data?.errors) {
        Object.assign(errors.value, error.data.data.errors);
      }

      // Message d'erreur global
      globalError.value =
        error.data?.statusMessage ||
        error.data?.message ||
        error.message ||
        'Une erreur est survenue. Veuillez réessayer.';

      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Réinitialise le formulaire
   */
  const resetForm = () => {
    formData.value = { ...PODCAST_INVITATION_INITIAL_FORM };
    errors.value = {};
    touched.value = {};
    isSubmitting.value = false;
    isSuccess.value = false;
    globalError.value = '';
  };

  /**
   * Vérifie si un champ a une erreur à afficher
   */
  const hasError = (fieldName: keyof PodcastInvitationFormData): boolean => {
    return touched.value[fieldName] && !!errors.value[fieldName];
  };

  /**
   * Obtient le message d'erreur d'un champ
   */
  const getError = (fieldName: keyof PodcastInvitationFormData): string | undefined => {
    return touched.value[fieldName] ? errors.value[fieldName] : undefined;
  };

  return {
    // État
    formData,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    globalError,

    // Computed
    canSubmit,

    // Méthodes de validation
    validateField,
    validateForm,
    handleBlur,
    hasError,
    getError,
    getCharacterCount,

    // Méthodes d'action
    submitForm,
    resetForm,

    // Constantes exposées
    FIELD_LIMITS: PODCAST_INVITATION_FIELD_LIMITS,
  };
};
