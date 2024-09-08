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
    description: "Bientot disponible ici la répartition des services de l'État",
    icon: "i-heroicons-building-office",
    to: "/publications/institutions",
    display: false,
    color: "bg-green-100 text-green-700",
  },
];
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <!-- <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Documents</h1> -->

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Découverte de l'État</h1>
    </div>

    <div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      <UCard
        v-for="menu in documentCategories"
        :key="menu.title"
        :class="[menu.display ? '' : 'bg-gray-100']"
        class="custom-shadow p-4 hover:shadow-xl"
      >
        <NuxtLink :to="menu.display ? menu.to : '#'" class="flex items-start">
          <div class="mr-4 flex-shrink-0">
            <div
              :class="[
                'flex h-14 w-14 items-center justify-center rounded-full',
                menu.display ? menu.color : 'bg-gray-100 text-gray-700',
              ]"
            >
              <UIcon :name="menu.icon" class="h-8 w-8" />
            </div>
          </div>
          <div>
            <h2 class="font-bold">{{ menu.title }}</h2>
            <p class="text-sm text-gray-700">{{ menu.description }}</p>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
