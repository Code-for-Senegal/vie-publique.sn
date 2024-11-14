<script setup lang="ts">
const seoTitle = "Chiffres clés Législatives 2024 Sénégal";
const seoDescription =
  "Législatives du 17 Novembre 2024 Sénégal: coalitions, carte électoaale, résultats, candidats, partis politiques, législatives, présidentielles";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/elections/legislatives";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const electionCategories = [
  {
    display: true,
    title: "Les listes et candidats",
    shortTitle: "Listes",
    description: "Consulter les 41 listes retenues",
    icon: "i-heroicons-queue-list",
    to: "/elections/legislatives",
    color: "bg-green-100 text-green-700 border border-green-50",
  },
  {
    display: true,
    title: "Statistiques",
    shortTitle: "Statistiques",
    description: "Graphiques et chiffres clés",
    icon: "i-heroicons-chart-bar",
    to: "/elections/legislatives/statistiques",
    color: "bg-red-100 text-red-800 border border-red-50",
  },
  {
    display: true,
    title: "Guide de vote",
    shortTitle: "Guide",
    description: "Vidéos tutoriels",
    icon: "i-heroicons-video-camera",
    to: "/elections/legislatives/guide-electoral",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-50",
  },
  {
    display: true,
    title: "Carte électorale",
    shortTitle: "Carte",
    description: "Lieux et bureaux de vote.",
    icon: "i-heroicons-map",
    to: "/elections/legislatives/carte-electorale",
    color: "bg-purple-100 text-purple-500 border border-purple-50",
  },
  {
    display: true,
    title: "Fichier électoral",
    shortTitle: "Vérification fichier",
    description: "Vérifiez votre inscription",
    icon: "i-heroicons-check",
    to: "https://elections.sec.gouv.sn",
    color: "bg-blue-100 text-blue-800 border border-blue-50",
  },

  {
    display: false,
    title: "Résultats",
    shortTitle: "shortTitle",
    description: "Disponible le jour du vote",
    icon: "i-heroicons-star",
    to: "#",
    color: "bg-gray-100 text-gray-500 border border-gray-50",
  },
];
</script>

<template>
  <LayoutSubcategoryComponent
    :item="electionCategories"
    :title="`Élections Législatives 2024`"
  />
</template>
