<script setup lang="ts">
interface Props {
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 5000,
});

const { shouldShowConsentModal, subscribe, markAsAsked, state, isSupported, isIOSSafari, initState } = useNotifications();

const isVisible = ref(false);
const isProcessing = ref(false);

const handleAccept = async () => {
  isProcessing.value = true;
  try {
    await subscribe();
  } finally {
    isProcessing.value = false;
    isVisible.value = false;
  }
};

const handleDecline = () => {
  markAsAsked();
  isVisible.value = false;
};

const handleContinueWithout = () => {
  markAsAsked();
  isVisible.value = false;
};

// Auto-show modal after delay on mount
onMounted(() => {
  if (!import.meta.client) return;
  // Don't show on iOS Safari (no Web Push support)
  if (isIOSSafari.value) return;
  if (!isSupported.value) return;

  // Re-init state to ensure we have fresh data
  initState();

  setTimeout(() => {
    if (shouldShowConsentModal.value) {
      isVisible.value = true;
    }
  }, props.delay);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleDecline"
        />

        <!-- Modal -->
        <Transition name="slide-up">
          <div
            v-if="isVisible"
            class="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <!-- Header link -->
            <div class="px-4 pt-4 sm:px-6 sm:pt-6">
              <button
                type="button"
                class="text-sm text-gray-500 dark:text-gray-400 underline hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                @click="handleContinueWithout"
              >
                Continuer sans accepter &rarr;
              </button>
            </div>

            <!-- Content -->
            <div class="px-4 py-4 sm:px-6 sm:py-6">
              <!-- Title -->
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                Restez informé des actualités du Sénégal
              </h2>

              <!-- Description -->
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                <span class="font-semibold text-green-600 dark:text-green-400">Vie Publique Sénégal</span>
                peut vous envoyer des notifications pour vous tenir informé des dernières actualités,
                des mises à jour budgétaires et de l'activité parlementaire.
              </p>

              <!-- Benefits -->
              <ul class="space-y-2 mb-6">
                <li class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <UIcon
                    name="i-heroicons-bell-alert"
                    class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  />
                  <span>Alertes sur les actualités importantes</span>
                </li>
                <li class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  />
                  <span>Nouveaux documents officiels publiés</span>
                </li>
                <li class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <UIcon
                    name="i-heroicons-building-library"
                    class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  />
                  <span>Activités de l'Assemblée nationale</span>
                </li>
              </ul>

              <!-- Actions -->
              <div class="space-y-3">
                <UButton
                  block
                  size="lg"
                  color="primary"
                  :loading="isProcessing"
                  :disabled="state.loading"
                  class="font-semibold"
                  @click="handleAccept"
                >
                  <UIcon
                    v-if="!isProcessing"
                    name="i-heroicons-bell"
                    class="w-5 h-5 mr-2"
                  />
                  Accepter les notifications
                </UButton>

                <UButton
                  block
                  size="lg"
                  color="gray"
                  variant="ghost"
                  :disabled="isProcessing"
                  @click="handleDecline"
                >
                  Non merci
                </UButton>
              </div>

              <!-- Privacy note -->
              <p class="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                Vous pouvez modifier ce choix à tout moment dans les paramètres de votre navigateur.
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (min-width: 640px) {
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(20px) scale(0.95);
  }
}
</style>
