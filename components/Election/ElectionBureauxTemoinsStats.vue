<!-- components/Election/ElectionBureauxTemoinsStats.vue -->
<!-- # components/Bureau/BureauStats.vue -->
<template>
  <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4">
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      <!-- Total Bureaux -->
      <div class="text-center">
        <p class="text-sm text-gray-600">Bureaux</p>
        <p class="text-2xl font-semibold">{{ stats.totalBureaux }}</p>
      </div>

      <!-- Régions -->
      <div class="text-center">
        <p class="text-sm text-gray-600">Régions</p>
        <p class="text-2xl font-semibold">{{ stats.regions }}</p>
      </div>

      <!-- Départements -->
      <div class="text-center">
        <p class="text-sm text-gray-600">Départements</p>
        <p class="text-2xl font-semibold">{{ stats.departements }}</p>
      </div>

      <!-- Communes -->
      <div class="text-center">
        <p class="text-sm text-gray-600">Communes</p>
        <p class="text-2xl font-semibold">{{ stats.communes }}</p>
      </div>

      <!-- Électeurs -->
      <div class="text-center">
        <p class="text-sm text-gray-600">Électeurs</p>
        <p class="text-2xl font-semibold">
          {{ stats.electeurs.toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    totalBureaux: number;
    regions: number;
    departements: number;
    communes: number;
    electeurs: number;
  };
}>();
</script>
