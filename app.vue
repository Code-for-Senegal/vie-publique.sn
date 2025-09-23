<script setup lang="ts">
import { Toaster, toast } from "vue-sonner";
const isOpen = ref(false);

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
    <UHorizontalNavigation
      :links="links"
      class="navbar-menu hidden flex-1 items-center justify-end lg:flex"
      :ui="{
        base: 'flex items-center gap-x-4',
        active: 'font-semibold !bg-transparent',
        inactive: 'transition-colors duration-200 !bg-transparent hover:!bg-transparent',
        icon: {
          base: 'mr-0.5',
        },
      }"
    />

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
  </UContainer>
</template>

<style>
nav ul li a span {
  text-transform: capitalize;
  font-family: "Quicksand", sans-serif;
  font-weight: 500;
}

/* Styles spécifiques pour le menu horizontal dans la navbar */
.header_top nav ul li a {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  font-family: "Quicksand", sans-serif;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9) !important;
  background-color: transparent !important;
}

.header_top nav ul li a span {
  font-family: "Quicksand", sans-serif;
  font-weight: 600;
}

.header_top nav ul li a:hover {
  color: white !important;
  background-color: transparent !important;
  background: none !important;
}

.header_top nav ul li a svg,
.header_top nav ul li a i {
  color: rgba(255, 255, 255, 0.9) !important;
}

.header_top nav ul li a:hover svg,
.header_top nav ul li a:hover i {
  color: white !important;
}

.header_top nav ul li a.router-link-active,
.header_top nav ul li a.router-link-exact-active {
  color: white !important;
  border-bottom: 2px solid white;
  padding-bottom: calc(0.5rem - 2px);
}

.header_top nav ul li a.router-link-active svg,
.header_top nav ul li a.router-link-active i,
.header_top nav ul li a.router-link-exact-active svg,
.header_top nav ul li a.router-link-exact-active i {
  color: white !important;
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
