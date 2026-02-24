<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner';
import { useNotifications } from './composables/useNotifications';

// Configuration SEO selon l'environnement
const config = useRuntimeConfig();

// Push Notifications
const { initState, setupForegroundHandler, validateAndRefreshToken } = useNotifications();
const isProduction =
  config.public.siteUrl === 'https://vie-publique.sn' ||
  config.public.siteUrl === 'https://www.vie-publique.sn';

// Bloquer l'indexation en environnement de test
if (!isProduction) {
  useHead({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'googlebot', content: 'noindex, nofollow' },
      { name: 'bingbot', content: 'noindex, nofollow' },
    ],
  });
}

const isChatPage = ref(useRoute().path === '/chatbot');
watch(
  () => useRoute().path,
  (newPath) => {
    isChatPage.value = newPath === '/chatbot';
  },
);
const links = [
  {
    label: 'Accueil',
    icon: 'i-heroicons-home',
    to: '/',
  },
  {
    label: 'Actualités',
    description: 'Communiqués, Annonces, Articles',
    photo: '/unknown_member.webp',
    icon: 'i-heroicons-newspaper',
    to: '/actualites',
  },
  {
    label: 'Assemblée',
    description: "Suivez l'activité parlementaire",
    icon: 'i-heroicons-building-library',
    to: '/assemblee-nationale',
  },
  {
    label: 'Budget',
    description: 'Analyse et suivi du budget sénégalais',
    icon: 'i-heroicons-currency-dollar',
    to: '/budget-senegal',
  },
  {
    label: 'Documents',
    description: 'Journal officiel, Codes, Rapports OFNAC Cour des comptes...',
    icon: 'i-heroicons-rectangle-stack',
    to: '/documents',
  },
  {
    label: 'Menu',
    description: '',
    icon: 'i-heroicons-bars-3',
    to: '/menu',
  },
];

onMounted(() => {
  if (!import.meta.client || !('serviceWorker' in navigator)) return;

  // Service Worker update handling (production only)
  if (config.public.nodeEnv === 'test') {
    navigator.serviceWorker.addEventListener('controllerchange', () => {});

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        toast('Nouvelle version trouvée. Actualiser pour mettre à jour.', {
          action: {
            label: 'Recharger',
            onClick: () => location.reload(),
          },
        });
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast('Nouvelle version trouvée. Actualiser pour mettre à jour.', {
                action: {
                  label: 'Recharger',
                  onClick: () => location.reload(),
                },
              });
            }
          });
        }
      });
    });
  }

  // Initialize push notification state (synchronous, no SW needed)
  initState();

  // Setup foreground handler (waits for SW internally via async initMessaging)
  setupForegroundHandler();

  // Listen for push subscription changes from service worker (P15)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
      validateAndRefreshToken();
    }
  });
});
</script>

<template>
  <div>
    <!-- loader quand on change de page -->
    <NuxtLoadingIndicator />

    <!-- Header consolidé avec navigation -->
    <AppHeader :links="links" />

    <!-- App alert online and offline -->
    <ClientOnly>
      <AppLineAlert />
    </ClientOnly>

    <!-- PWA Install Prompt -->
    <!-- <ClientOnly>
      <AppInstallPrompt />
    </ClientOnly> -->

    <!-- Notification Consent Modal -->
    <ClientOnly>
      <NotificationConsentModal :delay="5000" />
    </ClientOnly>

    <Toaster position="bottom-center" />
  </div>
  <UContainer class="px-0 pb-20 sm:px-10 md:px-14 lg:px-28 lg:pb-0 xl:px-40">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <AppFooter />

    <!-- Navigation mobile fixe en bas -->
    <AppBottomNav v-show="!isChatPage" />
  </UContainer>
</template>

<style>
nav ul li a span {
  text-transform: capitalize;
  font-family: 'Quicksand', sans-serif;
  font-weight: 500;
}
</style>
