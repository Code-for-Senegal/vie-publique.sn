<script setup lang="ts">
const props = defineProps<{
  data: any;
}>();
</script>

<template>
  <div class="mx-auto max-w-4xl bg-white p-4 text-sm">
    <h1 class="mb-2 text-center text-xl font-bold">
      Tendances des finances publiques
    </h1>

    <div class="">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold">Évolution Taux de croissance du PIB</span>
      </div>
      <div>
        <BudgetTendanceGrowthRateChart :growth-rates="data.growthRates" />
      </div>
    </div>

    <div class="my-4">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold">Évolution Déficit budgétaire</span>
      </div>
      <div>
        <BudgetTendanceDebtCompositionChart />
      </div>
    </div>

    <div class="my-4">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold">Évolution Budget global</span>
      </div>
      <div class="text-center text-sm text-gray-500">
        🚧 En cours d'élaboration
      </div>
    </div>

    <div class="my-4">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold">Évolution Dette Publique</span>
      </div>
      <div class="text-center text-sm text-gray-500">
        🚧 En cours d'élaboration
      </div>
    </div>

    <div class="my-4">
      <div class="bg-beige-100 mb-2 p-2 text-center">
        <span class="font-bold">Évolution Recettes fiscales</span>
      </div>
      <div class="text-center text-sm text-gray-500">
        🚧 En cours d'élaboration
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-beige-300 {
  background-color: #d7ccc8;
}

.bg-beige-100 {
  background-color: #efebe9;
}
</style>
