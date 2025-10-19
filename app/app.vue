<script setup lang="ts">
import { Toaster, toast } from "vue-sonner";
const isOpen = ref(false);

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
  middleware: ["maintenance"],
});

const isChatPage = ref(useRoute().path === "/chatbot");
watch(
  () => useRoute().path,
  (newPath) => {
    isChatPage.value = newPath === "/chatbot";
  },
);
const links = [
  {
    label: "Accueil",
    icon: "i-heroicons-home",
    to: "/",
  },
  {
    label: "Actualités",
    description: "Communiqués, Annonces, Articles",
    photo: "/unknown_member.webp",
    icon: "i-heroicons-newspaper",
    to: "/actualites",
  },
  {
    label: "Assemblée",
    description: "Suivez l'activité parlementaire",
    icon: "i-heroicons-building-library",
    to: "/assemblee-nationale",
  },
  {
    label: "Annuaires",
    description: "Gouvernement, Sites Web, Justice...",
    icon: "i-heroicons-identification",
    to: "/annuaires",
  },
  {
    label: "Documents",
    description: "Journal officiel, Codes, Rapports OFNAC Cour des comptes...",
    icon: "i-heroicons-rectangle-stack",
    to: "/documents",
  },
  {
    label: "Menu",
    description: "",
    icon: "i-heroicons-bars-3",
    to: "/menu",
  },
];

const aboutUslinks = [
  {
    label: "Conseil des ministres",
    description: "Conseil des ministres",
    photo: "/unknown_member.webp",
    icon: "i-heroicons-document-text",
    to: "/conseil-des-ministres",
  },
  {
    label: "Assemblée Nationale",
    to: "/assemblee-nationale",
    icon: "i-heroicons-information-circle",
  },
  {
    label: "Newsletter",
    description: "Abonnez vous à notre newsletter",
    photo: "/unknown_member.webp",
    icon: "i-heroicons-envelope",
    to: "/newsletter",
  },
  {
    label: "À Propos",
    to: "/a-propos/qui-sommes-nous",
    icon: "i-heroicons-information-circle",
  },
];

onMounted(() => {
  if (import.meta.client && "serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {});

    navigator.serviceWorker.ready.then((registration) => {
      // Vérifier si une mise à jour est disponible immédiatement
      if (registration.waiting) {
        toast("Nouvelle version trouvée. Actualiser pour mettre à jour.", {
          action: {
            label: "Recharger",
            onClick: () => location.reload(),
          },
        });
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              toast(
                "Nouvelle version trouvée. Actualiser pour mettre à jour.",
                {
                  action: {
                    label: "Recharger",
                    onClick: () => location.reload(),
                  },
                },
              );
            }
          });
        }
      });
    });
  }
});
</script>

<template>
  <div
    class="lg:px-18 header_top sticky top-0 z-50 flex items-center justify-between opacity-100 md:px-10 xl:px-32"
  >
    <!-- PWA manifest -->
    <NuxtPwaManifest />

    <!-- loader quand on change de page -->
    <NuxtLoadingIndicator />

    <!-- HeaderBrand à gauche -->
    <AppHeader />

    <!-- Menu horizontal pour desktop uniquement -->
    <AppNavbar :links="links" />

    <!-- App alert online and offline -->
    <ClientOnly>
      <AppLineAlert />
    </ClientOnly>

    <Toaster position="bottom-center" />

    <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
    <ThemeToggle />
  </div>
  <UContainer class="px-0 sm:px-10 md:px-14 lg:px-28 xl:px-40">
    <!-- Navigation verticale pour mobiles (toggle visibility with Tailwind CSS) -->
    <USlideover v-model="isOpen">
      <div class="flex-1 p-2">
        <UButton
          color="primary"
          variant="link"
          size="xl"
          icon="i-heroicons-x-mark-20-solid"
          class="absolute end-5 top-5 z-10 -mt-4 flex sm:hidden"
          square
          padded
          @click="isOpen = false"
        />
        <div class="min-h-full">
          <h1 class="font-sans text-2xl font-bold uppercase text-gray-800">
            Vie-Publique.sn
          </h1>

          <UVerticalNavigation
            :links="links"
            :ui="{ size: 'text-md' }"
            class="vertical-nav"
            @click="isOpen = false"
          />

          <UVerticalNavigation
            :links="aboutUslinks"
            :ui="{ size: 'text-md' }"
            class="vertical-nav"
            @click="isOpen = false"
          />
        </div>
      </div>
    </USlideover>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <AppFooter />

    <!-- affichage des deux composants à rendre dynamique -->
    <AppBottomNav v-show="!isChatPage" />

    <DonateButton />
  </UContainer>
</template>

<style>
nav ul li a span {
  text-transform: capitalize;
  font-family: "Quicksand", sans-serif;
  font-weight: 500;
}

/* Style global pour la police du menu */
nav ul li a span {
  font-family: "Quicksand", sans-serif;
  font-weight: 500;
}

.vertical-nav ul li a {
  margin: 0.5rem;
  padding-left: 1rem !important;
  box-shadow: 0 2px 4px #0000001a;
  line-height: 2rem;
}

.vertical-nav {
  background-color: transparent;
}
.header_top {
  /* Option 0 */
  background: linear-gradient(90deg, #0000d3 0%, #010272);

  /* Option 1: Dégradé moderne violet/bleu */
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */

  /* Option 2: Dégradé élégant bleu profond */
  /* background: linear-gradient(120deg, #1e3c72 0%, #2a5298 100%); */

  /* Option 3: Dégradé moderne indigo/purple avec effet glassmorphism */
  /* background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.95) 0%,
    rgba(139, 92, 246, 0.95) 100%
  );
  backdrop-filter: blur(10px); */

  /* Option 4: Dégradé sombre élégant */
  /* background: linear-gradient(135deg, #1a1c20 0%, #2d3561 100%); */

  /* Option 5: Monochrome moderne */
  /* background: rgba(15, 23, 42, 0.97);
  backdrop-filter: saturate(200%) blur(20px); */

  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
</style>
