<script setup lang="ts">
useHead({
  title: "La république du Sénégal",
  meta: [
    {
      name: "description",
      content:
        "République du Sénégal, institutions, organisation, quiz etc ...",
    },
  ],
});

const documentCategories = [
  {
    title: "Budget de l'État",
    description:
      "les chiffres clés du budget 2024, Loi de finance, Rapport d'execution trimestriel",
    icon: "i-heroicons-banknotes",
    to: "/budget-senegal",
    display: true,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Quiz Jeux",
    description: "Jeux QCM sur les institutions et l'organisation de l'Etat",
    icon: "i-heroicons-puzzle-piece",
    to: "/quiz",
    display: true,
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Suivi promesses électorales",
    description:
      "Bientot disponible ici un outil de suivi des promesses électorales",
    icon: "i-heroicons-document-check",
    to: "/barometre-politique/",
    display: false,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Institutions de la république",
    description:
      "Bientot disponible ici la présentation des institutions de la république",
    icon: "i-heroicons-building-library",
    to: "/publications/institutions",
    display: false,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Organisation de l'État",
    description: "Répartition des services de l'État",
    icon: "i-heroicons-building-office",
    to: "/etat-senegal/organisation",
    display: false,
    color: "bg-green-100 text-green-700",
  },
];
</script>

<template>
  <LayoutSubcategoryComponent
    :item="documentCategories"
    :title="`Découverte de l'État`"
  />
</template>
