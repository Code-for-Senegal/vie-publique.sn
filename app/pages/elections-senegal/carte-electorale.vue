<script setup lang="ts">
/**
 * Page Carte Électorale - Sénégal
 */

useHead({
  title: 'Carte Électorale | Élections Sénégal',
  meta: [
    { name: 'description', content: 'Explorez la cartographie électorale du Sénégal : lieux de vote, répartition géographique et statistiques.' }
  ]
});

const optionMap = "Vue Carte";
const optionList = "Vue Liste";
const selectedOptions = ref(optionMap);

const listViewTypes = [
  {
    label: optionMap,
    icon: "i-heroicons-map-solid",
  },
  {
    label: optionList,
    icon: "i-heroicons-list-bullet-solid",
  },
];

const tabs = [
  {
    label: "Nationale",
    icon: "i-heroicons-map",
  },
  {
    label: "Diaspora",
    icon: "i-heroicons-globe-europe-africa",
  },
  {
    label: "Résumé",
    icon: "i-heroicons-chart-bar",
  },
];

// Gestionnaire quand la carte est prête
const handleMapReady = (map: unknown) => {
  console.log("Carte chargée et prête");
};
</script>

<template>
  <div class="flex flex-col items-center px-4 py-8 min-h-screen">
    <div class="w-full max-w-7xl mb-4">
      <nav class="mb-6">
        <NuxtLink to="/elections-senegal" class="inline-flex items-center text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="mr-2 h-4 w-4" /> Retour Élections
        </NuxtLink>
      </nav>

      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 dark:text-white">Carte Électorale</h1>
        <p class="text-gray-500 dark:text-gray-400 max-w-3xl">
          Visualisez les données électorales à travers le territoire national. Sélectionnez une région ou un département pour des informations détaillées.
        </p>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="w-full max-w-7xl">
      <UTabs :items="tabs" class="w-full">
        <template #item="{ item }">
          <!-- Résumé -->
          <div v-if="item.label === 'Résumé'" class="w-full pt-4">
            <ElectionMapSummary />
          </div>

          <!-- NATIONALE -->
          <div v-if="item.label === 'Nationale'" class="w-full pt-4">
            <!-- View Toggle -->
            <div class="mb-4 w-full flex justify-center">
              <div class="flex gap-2">
                <UButton
                  v-for="option in listViewTypes"
                  :key="option.label"
                  :color="selectedOptions === option.label ? 'white' : 'gray'"
                  :variant="selectedOptions === option.label ? 'solid' : 'ghost'"
                  size="md"
                  class="shadow-sm"
                  @click="selectedOptions = option.label"
                >
                  <UIcon :name="option.icon" class="w-5 h-5 mr-1" />
                  {{ option.label }}
                </UButton>
              </div>
            </div>

            <!-- CARTE -->
            <div v-if="selectedOptions == optionMap">
              <ElectionMapComponent4 @map-ready="handleMapReady" />
            </div>

            <!-- LISTE -->
            <div v-if="selectedOptions == optionList" class="w-full">
              <ElectionMapNationalDepartment />
            </div>
          </div>

          <!-- DIASPORA -->
          <div v-else-if="item.label === 'Diaspora'" class="w-full pt-4">
            <ElectionMapDiasporaCountries />
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template>
