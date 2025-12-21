<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner';

// Configuration SEO selon l'environnement
const config = useRuntimeConfig();
const isProduction = config.public.siteUrl === 'https://vie-publique.sn';

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

// Appliquer le middleware globalement
definePageMeta({
  middleware: ['maintenance'],
});

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
  // Service Worker uniquement en production
  if (
    import.meta.client &&
    config.public.nodeEnv === 'production' &&
    'serviceWorker' in navigator
  ) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {});

    navigator.serviceWorker.ready.then((registration) => {
      // Vérifier si une mise à jour est disponible immédiatement
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

    <Toaster position="bottom-center" />
  </div>
  <UContainer class="px-0 sm:px-10 md:px-14 lg:px-28 xl:px-40">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <AppFooter />

    <!-- affichage des deux composants à rendre dynamique -->
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
