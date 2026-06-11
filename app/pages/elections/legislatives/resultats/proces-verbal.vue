<template>
  <div class="min-h-screen flex flex-col items-center px-4 pb-16">
    <AppBreadcrumb
:items="[
      { label: 'Élections', to: '/elections' },
      { label: 'Législatives 2024', to: '/elections/legislatives' },
      { label: 'Résultats', to: '/elections/legislatives/resultats' },
      { label: 'Procès-verbaux' }
    ]" />

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center dark:text-white">Résultats Législatives 2024</h1>
    </div>
    <ElectionResultPvGrid />
  </div>
</template>

<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});
// Le composant sera automatiquement importé grâce à l'auto-import de Nuxt 3
</script>
