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

      <!-- Map Component -->
      <div class="bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden border dark:border-gray-800 shadow-2xl">
        <div class="p-6 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 class="text-2xl font-black uppercase tracking-tighter">Carte Interactive</h2>
            <p class="text-sm text-gray-500">Données par département.</p>
          </div>
          <div class="flex gap-2">
            <UBadge color="primary" variant="soft">National</UBadge>
            <UBadge color="gray" variant="ghost">Diaspora</UBadge>
          </div>
        </div>
        <div class="relative min-h-[700px]">
          <!-- Reusing the map component -->
          <ElectionMapComponent4 />
        </div>
      </div>
      
      <!-- Stats Overlay (Example) -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800">
           <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Bureaux de vote</h4>
           <p class="text-3xl font-black">~15,500</p>
           <p class="text-xs text-gray-500 mt-2">Répartis sur l'ensemble du territoire</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800">
           <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Lieux de vote</h4>
           <p class="text-3xl font-black">~7,000</p>
           <p class="text-xs text-gray-500 mt-2">Centres de vote principaux</p>
        </div>
        <div class="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border dark:border-gray-800">
           <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Inscrits</h4>
           <p class="text-3xl font-black">~7.3M</p>
           <p class="text-xs text-gray-500 mt-2">Électeurs sur le fichier national</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
}
</style>
