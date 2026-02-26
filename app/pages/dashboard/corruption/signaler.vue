<script setup lang="ts">
import type {
  WhistleblowingSubject,
  WhistleblowingSubjectsResponse,
  WhistleblowingSubmitRequest,
  WhistleblowingSubmitResponse,
} from '~/types/corruption';

// ─── Feature flag guard ──────────────────────────────────────────────
// const { isFeatureEnabled } = useFeatureFlags();
// if (!isFeatureEnabled('menu_dashboard_corruption')) {
//   throw showError({ statusCode: 404, statusMessage: 'Page introuvable' });
// }

// ─── SEO : noindex ───────────────────────────────────────────────────
useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
});

useSeoMeta({
  title: 'Signaler un problème',
  robots: 'noindex, nofollow, noarchive',
});

// ─── Stepper labels (visual only — all sections visible) ─────────────
const steps = [
  { number: 1, label: 'Choisir un sujet' },
  { number: 2, label: 'Décrire le problème' },
  { number: 3, label: 'Joindre une preuve' },
  { number: 4, label: 'Envoyer & suivre' },
];

// ─── Fetch subjects ──────────────────────────────────────────────────
const { data: subjectsData, error: subjectsError } = await useAsyncData(
  'whistleblowing-subjects',
  () => $fetch<WhistleblowingSubjectsResponse>('/api/whistleblowing/subjects'),
);

const subjects = computed<WhistleblowingSubject[]>(() => subjectsData.value?.subjects ?? []);
const subjectOptions = computed(() =>
  [{ value: '', label: 'Choisissez...' }].concat(
    subjects.value.map((s) => ({ value: s.id, label: s.label })),
  ),
);

// ─── Form state ──────────────────────────────────────────────────────
const selectedSubjectId = ref('');
const description = ref('');
const attachedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ─── Submit state ────────────────────────────────────────────────────
const submitting = ref(false);
const submitError = ref('');
const ticketResult = ref<WhistleblowingSubmitResponse | null>(null);

// ─── Computed ────────────────────────────────────────────────────────
const descriptionLength = computed(() => description.value.trim().length);

const canSubmit = computed(
  () =>
    !!selectedSubjectId.value &&
    descriptionLength.value >= 10 &&
    descriptionLength.value <= 1000 &&
    !submitting.value,
);

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.mp4';

// ─── File handling ───────────────────────────────────────────────────
function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    attachedFile.value = input.files[0];
  }
}

function removeFile() {
  attachedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

// ─── Submit ──────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!canSubmit.value) return;

  submitting.value = true;
  submitError.value = '';

  const payload: WhistleblowingSubmitRequest = {
    subjectId: selectedSubjectId.value,
    description: description.value.trim(),
    attachmentMeta: attachedFile.value
      ? {
          name: attachedFile.value.name,
          size: attachedFile.value.size,
          type: attachedFile.value.type,
        }
      : undefined,
  };

  try {
    const result = await $fetch<WhistleblowingSubmitResponse>('/api/whistleblowing/submit', {
      method: 'POST',
      body: payload,
    });
    ticketResult.value = result;
  } catch (err: any) {
    submitError.value = err?.data?.statusMessage || err?.message || "Erreur lors de l'envoi.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-6 sm:py-8">
        <AppBreadcrumb
          :items="[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Corruption', to: '/dashboard/corruption' },
            { label: 'Signaler' },
          ]"
          class="mb-4"
        />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Signaler un problème
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Décrivez un problème lié à la gouvernance ou aux services publics au Sénégal
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <!-- Subjects loading error -->
      <div v-if="subjectsError" class="mx-auto max-w-md py-12">
        <div
          class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-8 w-8 text-red-600" />
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            Impossible de charger les sujets.
          </p>
        </div>
      </div>

      <!-- Confirmation screen -->
      <div v-else-if="ticketResult" class="mx-auto max-w-md py-12 text-center">
        <div
          class="rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-900/20"
        >
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50"
          >
            <UIcon
              name="i-heroicons-check-circle"
              class="h-10 w-10 text-green-600 dark:text-green-400"
            />
          </div>
          <h2 class="text-xl font-bold text-green-900 dark:text-green-200">Signalement envoyé</h2>
          <p class="mt-2 text-sm text-green-700 dark:text-green-300">
            {{ ticketResult.message }}
          </p>
          <div class="mt-4 rounded-lg bg-white p-4 dark:bg-gray-800">
            <p class="text-sm text-gray-500 dark:text-gray-400">Votre numéro de suivi</p>
            <p class="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
              {{ ticketResult.ticketId }}
            </p>
          </div>
          <NuxtLink
            to="/dashboard/corruption"
            class="mt-6 inline-block rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Retour au dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Single-page form -->
      <div v-else class="mx-auto max-w-2xl">
        <!-- Stepper indicator (visual, non-interactive) -->
        <div class="mb-8 overflow-x-auto">
          <div class="flex items-center justify-between gap-1">
            <template v-for="(step, index) in steps" :key="step.number">
              <div class="flex items-center gap-1.5 whitespace-nowrap">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  :class="
                    (step.number === 1 && selectedSubjectId) ||
                    (step.number === 2 && descriptionLength >= 10) ||
                    (step.number === 3 && attachedFile) ||
                    (step.number === 4 && canSubmit)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  "
                >
                  {{ step.number }}
                </div>
                <span class="hidden text-xs font-medium text-gray-700 dark:text-gray-300 sm:inline">
                  {{ step.label }}
                </span>
              </div>
              <UIcon
                v-if="index < steps.length - 1"
                name="i-heroicons-arrow-long-right"
                class="mx-1 hidden h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600 sm:block"
              />
            </template>
          </div>
        </div>

        <div
          class="space-y-8 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-8"
        >
          <!-- Section 1: Sujet -->
          <section>
            <div class="mb-3 flex items-center gap-2">
              <span
                class="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                >1</span
              >
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">
                Sujet <span class="font-normal text-gray-500">de votre signalement</span>
              </h2>
            </div>
            <USelect
              v-model="selectedSubjectId"
              :options="subjectOptions"
              value-attribute="value"
              option-attribute="label"
              placeholder="Choisissez..."
              size="lg"
              class="w-full"
            />
          </section>

          <!-- Section 2: Décrire -->
          <section>
            <div class="mb-3 flex items-center gap-2">
              <span
                class="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                >2</span
              >
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">Décrire le problème</h2>
            </div>
            <textarea
              v-model="description"
              class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              rows="5"
              placeholder="Expliquez ce qui s'est passé, où et quand"
              maxlength="1000"
            />
            <div class="mt-1 flex justify-between text-xs">
              <span class="text-gray-500 dark:text-gray-400">
                Soyez précis. Votre signalement doit être clair et factuel (min. 10 caractères).
              </span>
              <span :class="descriptionLength > 900 ? 'text-orange-500' : 'text-gray-400'">
                {{ descriptionLength }} / 1000
              </span>
            </div>
          </section>

          <!-- Section 3: Joindre une preuve -->
          <section>
            <div class="mb-3 flex items-center gap-2">
              <span
                class="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                >3</span
              >
              <h2 class="text-sm font-bold text-gray-900 dark:text-white">
                Joindre une preuve <span class="font-normal text-gray-500">(optionnel)</span>
              </h2>
            </div>

            <div
              v-if="!attachedFile"
              class="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div class="flex items-center gap-3">
                <div
                  class="bg-primary-100 dark:bg-primary-900/30 flex h-10 w-10 items-center justify-center rounded-lg"
                >
                  <UIcon
                    name="i-heroicons-cloud-arrow-up"
                    class="text-primary-600 dark:text-primary-400 h-5 w-5"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    Ajouter document, photo ou vidéo
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Formats acceptés : PDF, JPG, PNG, MP4
                  </p>
                </div>
              </div>
              <UButton color="primary" variant="solid" size="sm" @click="triggerFileInput">
                Charger un fichier
              </UButton>
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                :accept="ACCEPTED_TYPES"
                @change="onFileChange"
              />
            </div>

            <div
              v-else
              class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-document" class="text-primary-500 h-8 w-8" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ attachedFile.name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(attachedFile.size) }}</p>
                </div>
              </div>
              <button
                class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                @click="removeFile"
              >
                <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
              </button>
            </div>
          </section>

          <!-- Simulation warning -->
          <div
            class="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
          >
            V1 Simulation &mdash; Ce signalement ne sera pas réellement transmis. Il s'agit d'un
            prototype.
          </div>

          <!-- Error -->
          <div
            v-if="submitError"
            class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          >
            {{ submitError }}
          </div>

          <!-- Footer actions -->
          <div
            class="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700"
          >
            <NuxtLink
              to="/dashboard/corruption"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Consulter mes signalements
            </NuxtLink>
            <UButton
              color="primary"
              size="lg"
              :disabled="!canSubmit"
              :loading="submitting"
              @click="handleSubmit"
            >
              Envoyer
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
