<script setup lang="ts">
interface StatSection {
  title: string;
  color: string;
  stats: Array<{
    label: string;
    value: string | number;
    trend?: number;
    icon?: string;
  }>;
}

const summaryData: StatSection[] = [
  {
    title: "Total",
    color: "gray",
    stats: [
      { label: "Électeurs", value: "7 371 890", icon: "i-heroicons-users" },
      { label: "Lieux de vote", value: "7 048", icon: "i-heroicons-map-pin" },
      {
        label: "Bureaux de vote",
        value: "16 440",
        icon: "i-heroicons-building-office",
      },
      {
        label: "Départements",
        value: "54",
        icon: "i-heroicons-map",
      },
    ],
  },
  {
    title: "Diaspora",
    color: "gray",
    stats: [
      { label: "Électeurs", value: "338 040", icon: "i-heroicons-users" },
      {
        label: "Bureaux de vote",
        value: "807",
        icon: "i-heroicons-building-office",
      },
      { label: "Lieux de vote", value: "367", icon: "i-heroicons-map-pin" },
      { label: "Pays", value: "50", icon: "i-heroicons-globe-americas" },
      {
        label: "Représentations diplomatiques",
        value: "37",
        icon: "i-heroicons-home-modern",
      },
      { label: "Localités", value: "302", icon: "i-heroicons-map" },
      //   {
      //     label: "Départements",
      //     value: "8",
      //     icon: "i-heroicons-building-library",
      //   },
    ],
  },
  {
    title: "Nationale",
    color: "gray",
    stats: [
      { label: "Électeurs", value: "7 033 850", icon: "i-heroicons-users" },
      { label: "Lieux de vote", value: "6 681", icon: "i-heroicons-map-pin" },
      {
        label: "Bureaux de vote",
        value: "15 633",
        icon: "i-heroicons-building-office",
      },
      {
        label: "Départements",
        value: "46",
        icon: "i-heroicons-map",
      },
    ],
  },
];
</script>

<template>
  <!-- En-tête -->
  <h2 class="mb-4 text-center text-2xl font-bold text-gray-800">
    Résumé du fichier électoral
  </h2>

  <!-- Sections -->
  <div
    v-for="section in summaryData"
    :key="section.title"
    class="mb-4 mt-2 space-y-2"
  >
    <!-- Titre de section avec barres -->
    <div class="flex items-center justify-center gap-4 px-4">
      <div :class="`h-[1px] w-full bg-${section.color}-300`"></div>
      <h3 class="text-lg font-bold" :class="`text-${section.color}-700`">
        {{ section.title }}
      </h3>
      <div :class="`h-[1px] w-full bg-${section.color}-300`"></div>
    </div>

    <!-- Grille de stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UCard
        v-for="stat in section.stats"
        :key="stat.label"
        class="custom-shadow bg-gray-50"
      >
        <div class="mb-1 flex items-center justify-between">
          <span class="flex items-center gap-2 text-sm text-gray-600">
            <UIcon :name="stat.icon" class="h-4 w-4 transition-colors" />
            {{ stat.label }}
          </span>
        </div>
        <div
          class="text-2xl font-bold text-red-700 transition-colors md:text-3xl"
        >
          {{ stat.value }}
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.border {
  @apply border-gray-200;
}

.group:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
