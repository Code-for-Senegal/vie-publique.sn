<script setup lang="ts">
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isVisible = ref(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isIOS = ref(false)
const isStandalone = ref(false)

// Vérifier si l'app est déjà installée ou en mode standalone
const checkIfInstalled = () => {
  if (import.meta.client) {
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
  }
}

// Vérifier si c'est iOS
const checkIfIOS = () => {
  if (import.meta.client) {
    const userAgent = window.navigator.userAgent.toLowerCase()
    isIOS.value = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
  }
}

// Vérifier si on doit afficher le prompt (pas affiché depuis 7 jours)
const shouldShowPrompt = () => {
  if (import.meta.client) {
    const lastDismissed = localStorage.getItem('pwa-install-dismissed')
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed)
      const now = new Date()
      const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff > 7
    }
    return true
  }
  return false
}

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt.value = e as BeforeInstallPromptEvent

  // Afficher après un délai si l'utilisateur n'a pas fermé récemment
  if (shouldShowPrompt() && !isStandalone.value) {
    setTimeout(() => {
      isVisible.value = true
    }, 3000)
  }
}

const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installée avec succès')
    }

    deferredPrompt.value = null
    isVisible.value = false
  }
}

const dismissPrompt = () => {
  isVisible.value = false
  if (import.meta.client) {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }
}

onMounted(() => {
  checkIfInstalled()
  checkIfIOS()

  if (!isStandalone.value) {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Pour iOS, afficher les instructions manuelles
    if (isIOS.value && shouldShowPrompt()) {
      setTimeout(() => {
        isVisible.value = true
      }, 5000)
    }
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="isVisible && !isStandalone"
      class="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-0 md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="/pwa-192x192.png" alt="Logo" class="w-8 h-8 rounded-lg" />
            <span class="text-white font-semibold text-sm">Vie Publique SN</span>
          </div>
          <button
            type="button"
            class="text-white/80 hover:text-white transition-colors"
            aria-label="Fermer"
            @click="dismissPrompt"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-4">
          <p class="text-gray-700 dark:text-gray-300 text-sm mb-4">
            {{ isIOS
              ? 'Installez notre app sur votre iPhone : appuyez sur le bouton partager puis "Sur l\'écran d\'accueil"'
              : 'Installez notre application pour un accès rapide et une expérience hors-ligne !'
            }}
          </p>

          <!-- Avantages -->
          <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-4">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
              Accès rapide depuis l'écran d'accueil
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
              Notifications des nouvelles actualités
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
              Consultation hors-ligne
            </li>
          </ul>

          <!-- Actions -->
          <div v-if="!isIOS" class="flex gap-2">
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              class="flex-1"
              @click="dismissPrompt"
            >
              Plus tard
            </UButton>
            <UButton
              color="primary"
              size="sm"
              class="flex-1"
              @click="installApp"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
              Installer
            </UButton>
          </div>
          <div v-else>
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              block
              @click="dismissPrompt"
            >
              J'ai compris
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
