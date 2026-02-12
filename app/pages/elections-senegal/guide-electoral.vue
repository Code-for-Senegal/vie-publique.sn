<script setup lang="ts">
/**
 * Page Guide Électoral - Sénégal
 */

// SEO avec Open Graph
useSeoMeta({
  title: 'Guide Électoral | Élections Sénégal',
  description: 'Apprenez comment voter au Sénégal : vidéos tutoriels, étapes du scrutin et conseils pour exercer votre droit de vote.',
  ogTitle: 'Guide Électoral - Élections Sénégal',
  ogDescription: 'Découvrez le processus de vote au Sénégal avec nos vidéos explicatives et guides pratiques.',
});
</script>

<template>
  <div class="min-h-screen py-12">
    <div class="container mx-auto px-4">
      <!-- Breadcrumb -->
      <UBreadcrumb
        class="mb-8"
        :links="[
          { label: 'Accueil', to: '/' },
          { label: 'Élections', to: '/elections-senegal' },
          { label: 'Guide Électoral' },
        ]"
      />

      <div class="mb-12">
        <h1 class="text-4xl font-black uppercase tracking-tighter mb-4">Guide de l'Électeur</h1>
        <p class="text-gray-500 dark:text-gray-400 max-w-2xl">
          Apprenez comment voter, découvrez les étapes du scrutin et assurez-vous de remplir votre devoir civique en toute sérénité.
        </p>
      </div>

      <!-- Component reusing existing guide logic -->
      <ElectionsDashboardGuideElectoralVideos />
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
