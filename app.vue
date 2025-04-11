<script setup lang="ts">
import { Toaster, toast } from "vue-sonner";
const isOpen = ref(false);
// Appliquer le middleware globalement
definePageMeta({
  middleware: ["maintenance"],
});

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
    label: "Budget",
    description: "....",
    icon: "i-heroicons-banknotes",
    to: "/budget-senegal",
  },
  {
    label: "Elections",
    description: "Élections législatives du 17 Novembre.",
    icon: "i-heroicons-information-circle",
    to: "/elections",
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
  // {
  //   label: "Quiz",
  //   description: "Jeux QCM sur les institutions publiques",
  //   photo: "/unknown_member.webp",
  //   icon: "i-heroicons-puzzle-piece",
  //   to: "/quiz",
  // },
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

defineShortcuts({
  escape: () => navigateTo("/"),
  "/": () => navigateTo("/"),
  meta_k: () => navigateTo("/"),
  a: () => navigateTo("/annuaires"),
  b: () => navigateTo("/budget-senegal"),
  c: () => navigateTo("/conseil-des-ministres"),
  d: () => navigateTo("/documents"),
});
</script>

<template>
  <div
    class="lg:px-18 top-header header_top sticky top-0 z-50 flex items-center justify-between opacity-100 md:px-10 xl:px-32"
  >
    <!-- PWA manifest -->
    <NuxtPwaManifest />

    <!-- loader quand on change de page -->
    <NuxtLoadingIndicator />

    <!-- HeaderBrand à gauche -->
    <AppHeader />

    <!-- App alert online and offline -->
    <ClientOnly>
      <AppLineAlert />
    </ClientOnly>

    <Toaster position="bottom-center" />

    <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
    <UButton
      class="text-white md:hidden"
      color="white"
      variant="link"
      size="xl"
      icon="i-heroicons-bars-3"
      @click="isOpen = true"
    />
  </div>
  <UHorizontalNavigation
    :links="links"
    class="second-header hidden w-auto items-center justify-center md:flex"
  >
  </UHorizontalNavigation>
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

    <!-- <NewsletterSocial /> -->
    <!-- affichage des deux composants à rendre dynamique -->
    <AppBottomNav />
    <AppFooter />
  </UContainer>
</template>

<style>
.second-header {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.second-header ul li a {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
}

nav ul li a span {
  text-transform: uppercase;
  font-family: "Quicksand", sans-serif;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.004);
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
  background: linear-gradient(90deg, #0000d3 0%, #010272);
  /* background: linear-gradient(90deg, #000000 0%, #3533cd); */
}
</style>
