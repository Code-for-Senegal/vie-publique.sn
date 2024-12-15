<script setup lang="ts">
/* SEO */
useHead({
  title:
    "l'information publique au Sénégal, Actualité au Sénégal | Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Information sur la République du Sénégal: Gouvernement de Diomaye et Sonko, journal officiel, rapports d'audit OFNAC Cours des Comptes CENTIG IGE",
    },
  ],
});

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

const newFeatures = [
  {
    label: "Législatives 2024",
    description: "Elections législatives anticipées du 17 Novembre",
    icon: "i-heroicons-star",
    to: "/elections",
  },
];
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <HomeBanner :menus="newFeatures" />

    <MenuHome :menus="links" />

    <div class="">
      <div class="prose prose-sm sm:prose mx-auto my-4">
        <h2 class="text-center text-gray-800">Dernières Publications</h2>
      </div>

      <HomeNews />

      <div class="mt-4 text-center">
        <NuxtLink
          to="/publications/actualites"
          class="text-green-700 underline"
        >
          Voir toutes les actualités
        </NuxtLink>
      </div>

      <UDivider site="sm" class="mt-4" />

      <div class="mt-4 text-center text-sm text-gray-500 sm:px-8">
        🛈 Vie-Publique est tenu par des bénévoles <br />
        si vous voyez une erreur merci de nous aider à corriger
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
}
</style>
