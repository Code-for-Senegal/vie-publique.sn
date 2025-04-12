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
    title: "Annuaire des députés",
    shortTitle: "Députés élus",
    description: "Les députés élus",
    icon: "i-heroicons-user",
    to: "/assemblee-nationale/deputes",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
  {
    display: true,
    title: "Classement des listes",
    shortTitle: "Classement listes",
    description: "Pourcentages et voix obtenus",
    icon: "i-heroicons-chart-bar-square",
    to: "/elections/legislatives/resultats/classement",
    color: "bg-red-100 text-red-500 border border-red-50",
  },
  {
    display: true,
    title: "Répartition hémyciycle",
    shortTitle: "Résultats",
    description: "Répartition des sièges par coalition",
    icon: "i-heroicons-star",
    to: "/elections/legislatives/resultats",
    color: "bg-blue-100 text-blue-500 border border-blue-50",
  },
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
];
</script>

<template>
  <div>
    <!-- <div class="mb-6 mt-2 grid grid-cols-1 gap-4 md:grid-cols-2"> -->
    <!-- <ElectionMenuSieges /> -->
    <!-- <ElectionMenuDepute /> -->
    <!-- <ElectionMenuClassement /> -->
    <!-- <ElectionMenuInfo /> -->
    <!-- </div> -->
    <LayoutSubcategoryComponent
      :item="electionCategories"
      :title="`Élections Législatives 2024`"
    />
  </div>
</template>
