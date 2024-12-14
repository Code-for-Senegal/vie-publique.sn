<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps({
  error: Object as () => NuxtError,
});
const handleError = () => clearError({ redirect: "/" });
const links = [
  {
    label: "Conseil des ministres",
    description: "Communiqués des conseil des ministres...",
    icon: "i-heroicons-document-text",
    to: "/conseil-des-ministres",
  },
  {
    label: "Annuaires",
    description: "Nominations gouvernement, Sites Web, Justice, Medias...",
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
    label: "Budget, Quiz",
    description:
      "Fonctionnement de l'état, Guide, Institutions, Budget, Quiz...",
    icon: "i-heroicons-information-circle",
    to: "/etat-senegal",
  },
];
</script>

<template>
  <UContainer class="py-8">
    <section
      class="mx-auto flex max-w-4xl flex-col items-center space-y-6 py-32 text-center"
    >
      <div v-if="error?.statusCode == 404" class="space-y-6">
        <h1 class="text-4xl font-bold sm:text-7xl">404</h1>
        <div class="ml-2 font-semibold">Page non trouvée</div>
        <p class="text-xl text-gray-500">
          Le contenu auquel vous tentez d'accéder n'existe pas ou n'est plus
          disponible.
        </p>
      </div>
      <div v-else class="space-y-6">
        Erreur système temporaire, ne vous ennuyez pas, nous allons la corriger.
      </div>
      <UButton color="black" @click="handleError">Retour à l'accueil</UButton>
      <HomeMenu :menus="links" />
    </section>
  </UContainer>
</template>
