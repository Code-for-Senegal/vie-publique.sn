<script setup lang="ts">
interface Props {
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 5000,
});

const {
  shouldShowConsentModal,
  subscribe,
  markAsAsked,
  state,
  isSupported,
  isIOSSafari,
  initState,
} = useNotifications();

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

  console.log('[NotificationModal] mounted — diagnostics:', {
    isIOSSafari: isIOSSafari.value,
    isSupported: isSupported.value,
    isStandalonePWA:
      'matchMedia' in window && window.matchMedia('(display-mode: standalone)').matches,
    notificationAPI: 'Notification' in window,
    permission: 'Notification' in window ? Notification.permission : 'N/A',
    serviceWorker: 'serviceWorker' in navigator,
    userAgent: navigator.userAgent.substring(0, 100),
  });

  // Don't show on iOS Safari (no Web Push support)
  if (isIOSSafari.value) return;
  if (!isSupported.value) return;

  // Re-init state to ensure we have fresh data
  initState();

  setTimeout(() => {
    console.log('[NotificationModal] timeout check — shouldShow:', shouldShowConsentModal.value);
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
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-0"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleDecline" />

        <!-- Modal -->
        <Transition name="slide-up">
          <div
            v-if="isVisible"
            class="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 sm:max-w-md dark:bg-gray-900 dark:ring-gray-800"
          >
            <!-- Content -->
            <div class="p-6 text-center">
              <!-- Icone d'illustration -->
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20"
              >
                <UIcon
                  name="i-heroicons-bell-alert"
                  class="h-8 w-8 text-green-600 dark:text-green-400"
                />
              </div>

              <!-- Title -->
              <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                Restez informé en temps réel
              </h2>

              <!-- Description simplifiée -->
              <p class="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <span class="font-semibold text-green-600 dark:text-green-400"
                  >Vie Publique Sénégal</span
                >
                souhaite vous envoyer les dernières actualités parlementaires et budgétaires.
              </p>

              <!-- Actions -->
              <div class="space-y-3">
                <UButton
                  block
                  size="xl"
                  color="green"
                  :loading="isProcessing"
                  :disabled="state.loading"
                  class="font-bold shadow-lg shadow-green-500/20"
                  @click="handleAccept"
                >
                  Accepter les notifications
                </UButton>

                <UButton
                  block
                  size="md"
                  color="gray"
                  variant="ghost"
                  :disabled="isProcessing"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="handleDecline"
                >
                  Plus tard
                </UButton>
              </div>

              <!-- Privacy note -->
              <p class="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Promis, pas de spam. Vous pouvez vous désabonner à tout moment.
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
