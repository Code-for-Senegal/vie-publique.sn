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
  <div class="min-h-screen bg-slate-50 dark:bg-gray-950 py-12">
    <div class="container mx-auto px-4">
      <!-- Nav -->
      <nav class="mb-8">
        <NuxtLink to="/elections-senegal" class="flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="mr-2" />
          Retour à l'accueil Élections
        </NuxtLink>
      </nav>

      <div class="mb-12">
        <h1 class="text-4xl font-black uppercase tracking-tighter mb-4">Cartographie Électorale</h1>
        <p class="text-gray-500 max-w-2xl">
          Visualisez les données électorales à travers le territoire national. Sélectionnez une région ou un département pour des informations détaillées.
        </p>
      </div>

      <!-- Main Content -->
      <div class="bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border dark:border-gray-800 shadow-2xl p-6">
        <UTabs :items="tabs" class="w-full">
          <template #item="{ item }">
            <!-- Résumé -->
            <div v-if="item.label === 'Résumé'" class="w-full pt-4">
              <ElectionMapSummary />
            </div>

            <!-- NATIONALE -->
            <div v-if="item.label === 'Nationale'" class="w-full pt-4">
              <!-- View Toggle -->
              <div class="mb-6 w-full flex justify-center">
                <div class="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
                  <button
                    v-for="option in listViewTypes"
                    :key="option.label"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    :class="selectedOptions === option.label 
                      ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
                    @click="selectedOptions = option.label"
                  >
                    <UIcon :name="option.icon" class="w-5 h-5" />
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- CARTE -->
              <div v-if="selectedOptions == optionMap" class="relative min-h-[700px]">
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
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style>
