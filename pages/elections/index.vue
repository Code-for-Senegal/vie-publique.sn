<script setup lang="ts">
useHead({
  title: "Election au Sénégal",
  meta: [
    {
      name: "description",
      content:
        "Vote et élection au Sénégal: carte électoaale, résultats, candidats, partis politiques, législatives, présidentielles, locales...",
    },
  ],
});

const electionCategories = [
  {
    display: true,
    title: "Les listes et candidats",
    description: "Consulter les 41 listes retenus",
    icon: "i-heroicons-queue-list",
    to: "/elections/legislatives",
    color: "bg-green-100 text-green-700",
  },
  {
    display: true,
    title: "Statistiques",
    description: "Graphiques et chiffres clés.",
    icon: "i-heroicons-chart-bar",
    to: "/elections/legislatives/statistiques",
    color: "bg-red-100 text-red-700",
  },
  {
    display: false,
    title: "Carte électorale",
    description: "Lieux et Bureaux de vote. Bientôt disponible",
    icon: "i-heroicons-map",
    to: "/elections/legislatives/carte",
    color: "bg-purple-100 text-purple-700",
  },
  {
    display: false,
    title: "Résultats",
    description: "Disponible le jour du vote",
    icon: "i-heroicons-star",
    to: "#",
    color: "bg-blue-100 text-blue-700",
  },
];
</script>

<template>
  <LayoutSubcategoryComponent
    :item="electionCategories"
    :title="`Élections Législatives 2024`"
  />
</template>
