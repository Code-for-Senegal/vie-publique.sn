<script setup lang="ts">
/**
 * Page Guide Électoral - Sénégal
 */

useHead({
  title: 'Guide Électoral | Élections Sénégal',
  meta: [
    { name: 'description', content: 'Vidéos tutoriels et explications sur le processus de vote au Sénégal.' }
  ]
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-gray-950 py-12">
    <div class="container mx-auto px-4">
      <!-- Breadcrumb / Back Navigation -->
      <nav class="mb-8">
        <NuxtLink to="/elections-senegal" class="flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="mr-2" />
          Retour à l'accueil Élections
        </NuxtLink>
      </nav>

      <div class="mb-12">
        <h1 class="text-4xl font-black uppercase tracking-tighter mb-4">Guide de l'Électeur</h1>
        <p class="text-gray-500 max-w-2xl">
          Apprenez comment voter, découvrez les étapes du scrutin et assurez-vous de remplir votre devoir civique en toute sérénité.
        </p>
      </div>

      <!-- Component reusing existing guide logic -->
      <div class="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border dark:border-gray-800 shadow-xl">
        <ElectionsDashboardGuideElectoralVideos />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
