<script setup lang="ts">
import { usePodcastInvitation } from '~/composables/podcasts/usePodcastInvitation';

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

// Utilisation du composable pour la logique du formulaire
const {
  formData,
  isSubmitting,
  isSuccess,
  globalError,
  canSubmit,
  handleBlur,
  hasError,
  getError,
  getCharacterCount,
  submitForm,
  resetForm,
  FIELD_LIMITS,
} = usePodcastInvitation();

/**
 * Ferme le modal et réinitialise le formulaire
 */
const handleClose = () => {
  resetForm();
  emit('close');
};

/**
 * Soumet le formulaire
 */
const handleSubmit = async () => {
  const success = await submitForm();

  if (success) {
    // Attendre 3 secondes avant de fermer pour afficher le message de succès
    setTimeout(() => {
      emit('success');
      handleClose();
    }, 3000);
  }
};

/**
 * Compteur de caractères pour les champs texte
 */
const topicCount = computed(() => getCharacterCount('topic_interest', FIELD_LIMITS.topicInterest.max));
const motivationCount = computed(() => getCharacterCount('motivation', FIELD_LIMITS.motivation.max));
</script>

<template>
  <UModal :model-value="isOpen" :ui="{ width: 'max-w-3xl' }" @update:model-value="(value) => !value && handleClose()">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              🎙️ Demande d'invitation au Podcast
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Partagez votre expertise avec notre communauté
            </p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="handleClose"
          />
        </div>
      </template>

      <!-- Success State -->
      <div v-if="isSuccess" class="py-8">
        <div class="text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <UIcon name="i-heroicons-check-circle" class="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h4 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Demande envoyée avec succès !
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Nous avons bien reçu votre demande. Un email de confirmation vous a été envoyé.
            Notre équipe vous contactera dans les 48 heures.
          </p>
        </div>
      </div>

      <!-- Form -->
      <form v-else class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Error Alert -->
        <UAlert
          v-if="globalError"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          :title="globalError"
          :close-button="{ icon: 'i-heroicons-x-mark', color: 'red', variant: 'link' }"
          @close="globalError = ''"
        />

        <!-- Section 1: Informations personnelles -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            Informations personnelles
          </h4>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormGroup
              label="Nom complet"
              required
              :error="getError('full_name')"
            >
              <UInput
                v-model="formData.full_name"
                placeholder="Prénom NOM"
                :disabled="isSubmitting"
                :color="hasError('full_name') ? 'red' : undefined"
                @blur="handleBlur('full_name')"
              />
            </UFormGroup>

            <UFormGroup
              label="Email"
              required
              :error="getError('email')"
            >
              <UInput
                v-model="formData.email"
                type="email"
                placeholder="email@exemple.com"
                :disabled="isSubmitting"
                :color="hasError('email') ? 'red' : undefined"
                @blur="handleBlur('email')"
              />
            </UFormGroup>

            <UFormGroup
              label="Téléphone"
              :error="getError('phone')"
              help="Format: +221 77 123 45 67"
            >
              <UInput
                v-model="formData.phone"
                type="tel"
                placeholder="+221 77 123 45 67"
                :disabled="isSubmitting"
                :color="hasError('phone') ? 'red' : undefined"
                @blur="handleBlur('phone')"
              />
            </UFormGroup>

            <UFormGroup
              label="Organisation"
              :error="getError('organization')"
            >
              <UInput
                v-model="formData.organization"
                placeholder="Entreprise, ONG, Institution..."
                :disabled="isSubmitting"
                :color="hasError('organization') ? 'red' : undefined"
                @blur="handleBlur('organization')"
              />
            </UFormGroup>

            <UFormGroup
              label="Poste/Fonction"
              class="sm:col-span-2"
              :error="getError('position')"
            >
              <UInput
                v-model="formData.position"
                placeholder="Directeur, Consultant, Chercheur..."
                :disabled="isSubmitting"
                :color="hasError('position') ? 'red' : undefined"
                @blur="handleBlur('position')"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- Section 2: À propos de votre participation -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            À propos de votre participation
          </h4>

          <UFormGroup
            label="Sujet que vous souhaitez aborder"
            required
            :error="getError('topic_interest')"
            :help="`${topicCount.current}/${topicCount.max} caractères (min. ${FIELD_LIMITS.topicInterest.min})`"
          >
            <UTextarea
              v-model="formData.topic_interest"
              placeholder="Décrivez le sujet ou le thème que vous aimeriez aborder dans le podcast..."
              :rows="3"
              :disabled="isSubmitting"
              :color="hasError('topic_interest') ? 'red' : undefined"
              @blur="handleBlur('topic_interest')"
            />
          </UFormGroup>

          <UFormGroup
            label="Votre domaine d'expertise"
            :error="getError('expertise_area')"
          >
            <UTextarea
              v-model="formData.expertise_area"
              placeholder="Économie, politique, technologie, santé, éducation..."
              :rows="2"
              :disabled="isSubmitting"
              :color="hasError('expertise_area') ? 'red' : undefined"
              @blur="handleBlur('expertise_area')"
            />
          </UFormGroup>

          <UFormGroup
            label="Pourquoi souhaitez-vous participer ?"
            required
            :error="getError('motivation')"
            :help="`${motivationCount.current}/${motivationCount.max} caractères (min. ${FIELD_LIMITS.motivation.min})`"
          >
            <UTextarea
              v-model="formData.motivation"
              placeholder="Partagez vos motivations et ce que vous espérez apporter à nos auditeurs..."
              :rows="3"
              :disabled="isSubmitting"
              :color="hasError('motivation') ? 'red' : undefined"
              @blur="handleBlur('motivation')"
            />
          </UFormGroup>

          <UFormGroup
            label="Votre disponibilité"
            :error="getError('availability')"
          >
            <UTextarea
              v-model="formData.availability"
              placeholder="Ex: Disponible les lundis et mercredis après-midi, flexible sur les horaires..."
              :rows="2"
              :disabled="isSubmitting"
              :color="hasError('availability') ? 'red' : undefined"
              @blur="handleBlur('availability')"
            />
          </UFormGroup>
        </div>

        <!-- Section 3: Réseaux sociaux -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            Réseaux sociaux (optionnel)
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Ajoutez vos profils pour faciliter la prise de contact
          </p>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormGroup
              label="Twitter/X"
              :error="getError('twitter')"
            >
              <UInput
                v-model="formData.twitter"
                placeholder="@username"
                icon="i-lucide-twitter"
                :disabled="isSubmitting"
                :color="hasError('twitter') ? 'red' : undefined"
                @blur="handleBlur('twitter')"
              />
            </UFormGroup>

            <UFormGroup
              label="LinkedIn"
              :error="getError('linkedin')"
            >
              <UInput
                v-model="formData.linkedin"
                placeholder="linkedin.com/in/username"
                icon="i-lucide-linkedin"
                :disabled="isSubmitting"
                :color="hasError('linkedin') ? 'red' : undefined"
                @blur="handleBlur('linkedin')"
              />
            </UFormGroup>

            <UFormGroup
              label="Facebook"
              :error="getError('facebook')"
            >
              <UInput
                v-model="formData.facebook"
                placeholder="facebook.com/username"
                icon="i-lucide-facebook"
                :disabled="isSubmitting"
                :color="hasError('facebook') ? 'red' : undefined"
                @blur="handleBlur('facebook')"
              />
            </UFormGroup>

            <UFormGroup
              label="Instagram"
              :error="getError('instagram')"
            >
              <UInput
                v-model="formData.instagram"
                placeholder="@username"
                icon="i-lucide-instagram"
                :disabled="isSubmitting"
                :color="hasError('instagram') ? 'red' : undefined"
                @blur="handleBlur('instagram')"
              />
            </UFormGroup>

            <UFormGroup
              label="Site web"
              class="sm:col-span-2"
              :error="getError('website')"
              help="Ex: https://monsite.com"
            >
              <UInput
                v-model="formData.website"
                placeholder="https://exemple.com"
                icon="i-heroicons-globe-alt"
                :disabled="isSubmitting"
                :color="hasError('website') ? 'red' : undefined"
                @blur="handleBlur('website')"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- Note informative -->
        <div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <UIcon name="i-heroicons-information-circle" class="mr-1.5 inline h-4 w-4" />
          Les champs marqués d'un <span class="text-red-500">*</span> sont obligatoires.
          Vos données sont traitées conformément à notre politique de confidentialité.
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
          <UButton
            color="gray"
            variant="ghost"
            label="Annuler"
            :disabled="isSubmitting"
            @click="handleClose"
          />
          <UButton
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="!canSubmit"
          >
            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande' }}
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>
