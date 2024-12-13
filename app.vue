<script setup lang="ts">
const { $pwa } = useNuxtApp();
const isOpen = ref(false);

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
    to: "/publications/actualites",
  },
  {
    label: "Annuaires",
    description: "Gouvernement, Sites Web, Justice...",
    icon: "i-heroicons-identification",
    to: "/annuaires",
  },
  {
    label: "Documents",
    description: "Journal officiel, Codes, Rapports OFNAC Cours des comptes...",
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
    label: "Installer",
    description: "Installer l'application PWA",
    icon: "i-heroicons-arrow-down-circle",
    click: () => "",
  },
  // {
  //   label: "Découverte",
  //   description: "Guide du fonctionnement de l'état, Budget, Quiz...",
  //   icon: "i-heroicons-information-circle",
  //   to: "/organisation",
  // },
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
    label: "Newsletter",
    description: "Abonnez vous à notre newsletter",
    photo: "/unknown_member.webp",
    icon: "i-heroicons-envelope",
    to: "/newsletter",
  },
  {
    label: "Quiz",
    description: "Jeux QCM sur les institutions publiques",
    photo: "/unknown_member.webp",
    icon: "i-heroicons-puzzle-piece",
    to: "/quiz",
  },
  {
    label: "À Propos",
    to: "/about/us",
    icon: "i-heroicons-information-circle",
  },
];
</script>

<template>
  <div
    class="lg:px-18 top-header sticky top-0 z-50 flex items-center justify-between opacity-100 md:px-10 xl:px-32"
  >
    <!-- PWA manifest -->
    <NuxtPwaManifest />
    <!-- loader quand on change de page -->
    <NuxtLoadingIndicator />

    <!-- HeaderBrand à gauche -->
    <AppHeader />

    <!-- Navigation horizontale pour les écrans plus larges -->
    <UHorizontalNavigation
      :links="links"
      class="hidden w-auto items-center md:flex"
    >
      <template #default="{ link }">
        <button
          v-if="
            link.click &&
            $pwa?.showInstallPrompt &&
            !$pwa?.offlineReady &&
            !$pwa?.needRefresh &&
            !$pwa.isPWAInstalled
          "
          class="hover:bg-primaryDark focus-visible:bg-primaryDark rounded"
          @click="$pwa.install"
        >
          <i :class="link.icon"></i>
          <span v-if="link.click" class="group-hover:text-primary relative">{{
            link.label
          }}</span>
        </button>
      </template>
    </UHorizontalNavigation>

    <!-- Menu pour mobiles (toggle visibility with Tailwind CSS) -->
    <UButton
      class="md:hidden"
      color="gray"
      variant="link"
      size="xl"
      icon="i-heroicons-bars-3"
      @click="isOpen = true"
    />
  </div>
  <UContainer class="px-0 sm:px-10 md:px-14 lg:px-28 xl:px-40">
    <!-- Navigation verticale pour mobiles (toggle visibility with Tailwind CSS) -->
    <USlideover v-model="isOpen">
      <div class="flex-1 p-4">
        <UButton
          color="gray"
          variant="ghost"
          size="xl"
          icon="i-heroicons-x-mark-20-solid"
          class="absolute end-5 top-5 z-10 flex sm:hidden"
          square
          padded
          @click="isOpen = false"
        />
        <div class="min-h-full">
          <AppHeader />

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
    <AppFooter />
  </UContainer>
</template>

<style>
.top-header {
  background-color: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
</style>
