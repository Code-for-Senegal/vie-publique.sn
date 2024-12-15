<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

// Structure de navigation pour les sous-sections
const parliamentaryActivities = [
  {
    display: true,
    title: "Groupes",
    description: "Groupes parlementaires de l'Assemblée nationale",
    icon: "i-heroicons-user-group",
    to: "/assemblee-nationale/groupes",
  },
  {
    color: "bg-emerald-100 text-emerald-500 border border-emerald-50",
    display: true,
    title: "Séances plénières",
    description: "Compte-rendus des séances plénières de l'Assemblée nationale",
    icon: "i-heroicons-rectangle-group",
    to: "/assemblee-nationale/seances-plenieres",
  },
  {
    display: true,
    title: "Commissions",
    description: "Travaux des commissions permanentes et spéciales",
    icon: "i-heroicons-document-text",
    to: "/assemblee-nationale/commissions",
  },
  {
    display: true,
    title: "Votes",
    description: "Textes et résolutions votées par l'Assemblée nationale",
    icon: "i-heroicons-document-check",
    to: "/assemblee-nationale/votes",
  },
  {
    display: true,
    title: "Questions au Gouvernement",
    description: "Questions écrites et orales adressées au Gouvernement",
    icon: "i-heroicons-question-mark-circle",
    to: "/assemblee-nationale/questions-gouvernement",
  },
];
</script>

<template>
  <div class="container mx-auto p-2 sm:p-4">
    <div class="prose prose-sm mx-auto mb-4 text-center">
      <!-- <div class="prose prose-sm sm:prose mx-auto mb-4"> -->
      <h1 class="mb-2">Assemblée nationale du Sénégal</h1>
      <p class="lead text-sm">
        Suivez l'actualité et les travaux de l'Assemblée nationale du Sénégal
      </p>
    </div>

    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
      <UCard
        v-for="activity in parliamentaryActivities"
        :key="activity.to"
        class="custom-shadow cursor-pointer transition-shadow hover:shadow-lg"
      >
        <NuxtLink :to="activity.to" class="flex items-start space-x-4">
          <UIcon
            :name="activity.icon"
            class="text-primary-500 h-6 w-6 flex-shrink-0"
          />
          <div>
            <h3 class="text-lg font-medium">{{ activity.title }}</h3>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
