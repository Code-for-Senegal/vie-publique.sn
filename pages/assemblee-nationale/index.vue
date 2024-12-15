<script setup lang="ts">
const seoTitle =
  "Assemblée nationale du Sénégal - Activité parlementaire | Vie-Publique.sn";
const seoDescription =
  "Suivez l'activité parlementaire de l'Assemblée nationale du Sénégal : séances plénières, commissions, textes adoptés, questions au gouvernement et travaux parlementaires.";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/elections/legislatives";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    {
      name: "keywords",
      content:
        "Assemblée nationale Sénégal, députés sénégalais, parlement sénégal, lois sénégal, séances plénières, commissions parlementaires",
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

const parliamentaryActivities = [
  {
    display: true,
    title: "Les députés",
    description: "Annuaire 15e législature",
    icon: "i-heroicons-user",
    to: "/assemblee-nationale/deputes",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
  {
    display: true,
    title: "Les groupes",
    description: "Groupes parlementaires",
    icon: "i-heroicons-user-group",
    to: "/assemblee-nationale/groupes",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },

  {
    display: true,
    title: "Les commissions",
    description: "Travaux des commissions",
    icon: "i-heroicons-document-text",
    to: "/assemblee-nationale/commissions",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
  {
    display: true,
    title: "Les votes",
    description: "Textes et résolutions votées",
    icon: "i-heroicons-document-check",
    to: "/assemblee-nationale/votes",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
  {
    display: true,
    title: "Questions écrites",
    description: "Questions des députés",
    icon: "i-heroicons-question-mark-circle",
    to: "/assemblee-nationale/questions",
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  },
  // {
  //   display: false,
  //   title: "Bureau de l'Assemblée",
  //   description: "Travaux des commissions",
  //   icon: "i-heroicons-document-text",
  //   to: "/assemblee-nationale/commissions",
  //   color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
  // },
];
</script>

<template>
  <div>
    <LayoutSubcategoryComponent
      :item="parliamentaryActivities"
      title="Assemblée nationale du Sénégal"
    />
  </div>
</template>
