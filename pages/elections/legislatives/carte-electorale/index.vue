//pages/election-map.vue
<script setup lang="ts">
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
  // Vous pouvez ajouter ici des configurations supplémentaires pour la carte
};
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <!-- Breadcrumb -->
    <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Tableau de bord', to: '/elections' },
        { label: 'carte' },
      ]"
    />

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Carte électorale 2024</h1>
    </div>

    <UTabs :items="tabs" class="w-full">
      <template #item="{ item }">
        <div v-if="item.label === 'Résumé'" class="w-full">
          <ElectionMapSummary />
        </div>

        <!-- NATIONALE -->
        <div v-if="item.label === 'Nationale'" class="w-full">
          <div class="my-2 w-full text-center">
            <UButton
              v-for="option in listViewTypes"
              :key="option.label"
              class="custom-shadow mb-1 ml-1"
              :color="selectedOptions === option.label ? 'white' : 'gray'"
              :class="
                selectedOptions === option.label
                  ? 'border-b border-green-700 font-semibold text-green-700'
                  : ''
              "
              size="md"
              @click="
                selectedOptions =
                  selectedOptions === option.label ? '' : option.label
              "
            >
              {{ option.label }}
            </UButton>
          </div>

          <!-- CARTE -->
          <ElectionMapComponent4
            v-if="selectedOptions == optionMap"
            @map-ready="handleMapReady"
          />

          <!-- LISTE -->
          <div v-if="selectedOptions == optionList" class="w-full">
            <ElectionMapNationalDepartment />
          </div>
        </div>

        <!-- DIASPORA -->
        <div v-else-if="item.label === 'Diaspora'" class="w-full">
          <ElectionMapDiasporaCountries />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<style scoped>
.radio-group-custom {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}
</style>
