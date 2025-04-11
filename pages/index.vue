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

const navigationCards = [
  {
    title: "Assemblée Nationale",
    description: "Suivez l'activité parlementaire",
    image: "/images/menu/assemblee-nationale-1.jpg",
    to: "/assemblee-nationale",
  },
  {
    title: "Annuaire Députés",
    description: "Découvrez les députés élus",
    image: "/images/elections/deputes.png",
    to: "/assemblee-nationale/deputes",
  },
  {
    title: "Budget 2025 Sénégal",
    description: "Loi de finances 2025",
    image: "/images/menu/budget-2.jpg",
    to: "/budget-senegal",
  },
  {
    title: "Conseil des ministres",
    description: "Communiqués des conseil des ministres",
    image: "/images/communique-conseil-des-ministres-1.jpg",
    to: "/conseil-des-ministres",
  },
  {
    title: "Annuaire",
    description: "Nominations, Sites Web, Justice, Medias...",
    image: "/images/menu/annuaire-2.svg",
    to: "/annuaires",
  },
  {
    title: "Documents",
    description: "Journal officiel, Codes, Rapports audit...",
    image: "/images/menu/document-2.svg",
    to: "/documents",
  },
];
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <MenuHome2 :navigation-cards="navigationCards" />

    <div class="">
      <div class="prose prose-sm sm:prose mx-auto my-4">
        <h2 class="text-center text-gray-800">À la une</h2>
      </div>

      <HomeNews />

      <div class="mt-4 text-center">
        <NuxtLink to="/actualites" class="text-green-700 underline">
          Voir toutes les actualités
        </NuxtLink>
      </div>

      <UDivider site="sm" class="mt-4" />

      <!-- <PartnersSection /> -->
      <!-- <PartnersSection2 /> -->

      <div class="mb-8 mt-4 text-center text-sm text-gray-500 sm:px-8">
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
