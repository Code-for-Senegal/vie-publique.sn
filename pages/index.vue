<script setup lang="ts">
/* SEO */
useHead({
  title: "l'information publique au Sénégal | Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Information sur la République du Sénégal: Président Bassirou Diomaye FAYE, Gouvernement Ousmane SONKO, journal officiel, rapports d'audit OFNAC Cours des Comptes CENTIG IGE",
    },
  ],
});

const navigationCards = [
  {
    title: "Assemblée Nationale",
    description: "Suivez l'activité parlementaire",
    icon: "i-heroicons-building-library",
    to: "/assemblee-nationale",
  },
  {
    title: "Journal officiel Sénégal",
    description: "Lois, Décrets, Arrêtés",
    icon: "i-heroicons-newspaper",
    to: "/documents/journal-officiel",
  },
  {
    title: "Budget du Sénégal",
    description: "Loi de finances 2025",
    icon: "i-heroicons-banknotes",
    to: "/budget-senegal",
  },
  {
    title: "Conseil des ministres",
    description: "Communiqués Comptes rendus",
    icon: "i-heroicons-briefcase",
    to: "/conseil-des-ministres",
  },
  {
    title: "Annuaire",
    description: "Nominations, Sites, Medias...",
    icon: "i-heroicons-book-open",
    to: "/annuaires",
  },
  {
    title: "Documents",
    description: "Journal officiel, Codes, Rapports",
    icon: "i-heroicons-document-text",
    to: "/documents",
  },
];
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <MenuHomeV4 :navigation-cards="navigationCards" />

    <div class="">
      <HomeNews />
      <!-- Dernières mises à jour -->
      <HomeLatestUpdates />
      <HomeSocialNetworks />
      <HomeTwitterTimeline />

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
