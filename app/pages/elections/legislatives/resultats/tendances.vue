<!-- pages/resultats.vue -->
<template>
  <div class="min-h-screen pb-16">
    <AppBreadcrumb
:items="[
      { label: 'Élections', to: '/elections' },
      { label: 'Législatives 2024', to: '/elections/legislatives' },
      { label: 'Résultats', to: '/elections/legislatives/resultats' },
      { label: 'Tendances' }
    ]" />

    <!-- Le composant sera automatiquement importé si le fichier est placé dans le bon dossier -->
    <ElectionResultsDisplay />
  </div>
</template>

<script setup lang="ts">
// Pas besoin d'import ici, Nuxt le fait automatiquement
</script>
